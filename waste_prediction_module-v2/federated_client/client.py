import flwr as fl
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import os
import time
import threading
import logging
from datetime import datetime
from dotenv import load_dotenv
from model import WastePredictor
from collections import OrderedDict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uvicorn

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('predictions.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# --- Data Structures ---

class TrainingData(BaseModel):
    features: List[float]  # Expecting 5 features
    targets: List[float]   # Expecting 8 targets

class PredictionRequest(BaseModel):
    features: List[float]  # Expecting 5 features: production_volume, rain_sum, temperature_mean, humidity_mean, wind_speed_mean

class DataBuffer:
    def __init__(self):
        self.data = []
        self.lock = threading.Lock()

    def add_data(self, features, targets):
        with self.lock:
            self.data.append((features, targets))

    def get_and_clear_data(self):
        with self.lock:
            if not self.data:
                return None, None
            
            features = [d[0] for d in self.data]
            targets = [d[1] for d in self.data]
            
            # Clear the buffer after retrieving
            self.data = []
            
            return torch.tensor(features, dtype=torch.float32), torch.tensor(targets, dtype=torch.float32)

# Global buffer
data_buffer = DataBuffer()
client_thread = None
client_running = False

# Global model for inference
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "federated_server", "models", "waste_predictor.pt")
try:
    inference_model = torch.load(MODEL_PATH, weights_only=False)
    print(f"Loaded full model (with normalization) from {MODEL_PATH}")
except Exception as e:
    inference_model = WastePredictor()
    print(f"No pretrained model found, using randomly initialized weights: {e}")

# --- Flower Client ---

class ClientDisconnect(Exception):
    """Exception to signal client disconnection."""
    pass

class WasteClient(fl.client.NumPyClient):
    def __init__(self, model, data_buffer):
        self.model = model
        self.data_buffer = data_buffer

    def get_parameters(self, config):
        return [val.cpu().numpy() for _, val in self.model.state_dict().items()]

    def set_parameters(self, parameters):
        params_dict = zip(self.model.state_dict().keys(), parameters)
        state_dict = OrderedDict({k: torch.tensor(v) for k, v in params_dict})
        self.model.load_state_dict(state_dict, strict=True)

    def fit(self, parameters, config):
        # 1. Update local model with server parameters
        self.set_parameters(parameters)
        
        # 2. Get Data
        X_train, y_train = self.data_buffer.get_and_clear_data()
        
        if X_train is None or len(X_train) == 0:
            print("Client: No API data received. Returning unchanged parameters.")
            # Return current parameters with 0 samples to indicate no training
            # This allows graceful handling without raising an exception
            return self.get_parameters(config={}), 0, {"status": "no_data"}
        
        print(f"Client: Training on {len(X_train)} samples received via API.")

        # 3. Local Training Loop
        criterion = nn.MSELoss()
        optimizer = optim.Adam(self.model.parameters(), lr=0.001)
        epochs = 1  # Local epochs
        
        self.model.train()
        for _ in range(epochs):
            optimizer.zero_grad()
            outputs = self.model(X_train)
            loss = criterion(outputs, y_train)
            loss.backward()
            optimizer.step()
            
        print(f"Client: Training complete. Loss: {loss.item():.4f}")
        
        print("Client: Waiting 5 seconds before sending results...")
        time.sleep(5)

        # 4. Return updated parameters to server for aggregation (FedAvg)
        return self.get_parameters(config={}), len(X_train), {}

    def evaluate(self, parameters, config):
        self.set_parameters(parameters)
        
        # Simulate inference on synthetic data
        # Inputs: production_volume, rain_sum, temperature_mean, humidity_mean, wind_speed_mean
        # Generate 10 random samples
        X_test = torch.randn(10, 5) 
        # In a real scenario, this would come from the Digital Twin
        
        self.model.eval()
        with torch.no_grad():
            predictions = self.model(X_test)
            
        # Calculate some dummy loss or metric (e.g., mean prediction value)
        # Since we don't have ground truth for this synthetic inference, we just report statistics
        mean_waste = predictions[:, 0].mean().item() # Total_Waste_kg
        
        print(f"Client: Inference performed. Mean Total Waste: {mean_waste:.2f} kg")
        
        # Return loss=0.0 because we are not validating against ground truth, just reporting metrics
        return 0.0, 10, {"mean_total_waste": mean_waste}

# --- FastAPI App ---

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.post("/train-data")
async def receive_training_data(data: TrainingData):
    global client_thread, client_running
    
    if len(data.features) != 5:
        raise HTTPException(status_code=400, detail="Features must have 5 elements")
    if len(data.targets) != 8:
        raise HTTPException(status_code=400, detail="Targets must have 8 elements")
    
    data_buffer.add_data(data.features, data.targets)
    
    # Check if client needs to be started
    if not client_running:
        print("API: Data received. Starting Flower client...")
        start_flower_thread()
        
    return {"status": "success", "message": "Data added to training buffer", "buffer_size": len(data_buffer.data)}

@app.get("/status")
async def get_status():
    return {
        "buffer_size": len(data_buffer.data),
        "client_running": client_running
    }

@app.post("/predict")
async def predict(data: PredictionRequest):
    """Get waste predictions for given features."""
    if len(data.features) != 5:
        raise HTTPException(status_code=400, detail="Features must have 5 elements: production_volume, rain_sum, temperature_mean, humidity_mean, wind_speed_mean")
    
    # Convert to tensor
    features_tensor = torch.tensor([data.features], dtype=torch.float32)
    
    # Run inference
    inference_model.eval()
    with torch.no_grad():
        predictions = inference_model(features_tensor)
    
    # Convert predictions to list
    pred_list = predictions[0].tolist()
    
    # Log the prediction
    logger.info("=" * 60)
    logger.info("PREDICTION REQUEST")
    logger.info(f"Timestamp: {datetime.now().isoformat()}")
    logger.info(f"Input Features:")
    logger.info(f"  - production_volume: {data.features[0]}")
    logger.info(f"  - rain_sum: {data.features[1]}")
    logger.info(f"  - temperature_mean: {data.features[2]}")
    logger.info(f"  - humidity_mean: {data.features[3]}")
    logger.info(f"  - wind_speed_mean: {data.features[4]}")
    logger.info(f"Predictions:")
    logger.info(f"  - Total_Waste_kg: {pred_list[0]:.4f}")
    logger.info(f"  - Solid_Waste_Limestone_kg: {pred_list[1]:.4f}")
    logger.info(f"  - Solid_Waste_Gypsum_kg: {pred_list[2]:.4f}")
    logger.info(f"  - Solid_Waste_Industrial_Salt_kg: {pred_list[3]:.4f}")
    logger.info(f"  - Liquid_Waste_Bittern_Liters: {pred_list[4]:.4f}")
    logger.info(f"  - Potential_Epsom_Salt_kg: {pred_list[5]:.4f}")
    logger.info(f"  - Potential_Potash_kg: {pred_list[6]:.4f}")
    logger.info(f"  - Potential_Magnesium_Oil_Liters: {pred_list[7]:.4f}")
    logger.info("=" * 60)
    
    return {
        "status": "success",
        "predictions": {
            "Total_Waste_kg": pred_list[0],
            "Solid_Waste_Limestone_kg": pred_list[1],
            "Solid_Waste_Gypsum_kg": pred_list[2],
            "Solid_Waste_Industrial_Salt_kg": pred_list[3],
            "Liquid_Waste_Bittern_Liters": pred_list[4],
            "Potential_Epsom_Salt_kg": pred_list[5],
            "Potential_Potash_kg": pred_list[6],
            "Potential_Magnesium_Oil_Liters": pred_list[7]
        },
        "raw_predictions": pred_list
    }

def start_flower_thread():
    global client_thread, client_running
    
    # Initialize model architecture
    model = WastePredictor()
    server_address = os.getenv("SERVER_ADDRESS")
    
    if not server_address:
        print("Error: SERVER_ADDRESS environment variable is not set")
        return

    def run_client():
        global client_running
        client_running = True
        print(f"Connecting to server at {server_address}")
        try:
            fl.client.start_client(
                server_address=server_address, 
                client=WasteClient(model, data_buffer).to_client()
            )
        except Exception as e:
            print(f"Client stopped: {e}")
        finally:
            client_running = False
            print("Client disconnected.")

    client_thread = threading.Thread(target=run_client, daemon=True)
    client_thread.start()

def main():
    # Start FastAPI server
    # Using port 8001 to avoid conflict if server is on 8000 or 8080
    print("Starting API server on port 8001...")
    uvicorn.run(app, host="0.0.0.0", port=8001)

if __name__ == "__main__":
    main()
