from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import pandas as pd
import os
from typing import List
from src.digital_twin import WasteDistributor

tags_metadata = [
    {
        "name": "Health",
        "description": "System status and model calibration checks.",
    },
    {
        "name": "Simulation",
        "description": "Run simulations for specific scenarios.",
    },
    {
        "name": "Data",
        "description": "Access generated historical data.",
    },
]

app = FastAPI(
    title="Salt Production Digital Twin API",
    description="This API exposes the Digital Twin capabilities for the Puttalam Salt Production facility. "
                "It allows for real-time simulation of waste composition based on physics-based models.",
    version="1.0.0",
    openapi_tags=tags_metadata
)

# --- Global Model Instance ---
distributor = None
DATA_PROCESSED_DIR = 'data/processed'
DATA_ORIGINAL_DIR = 'data/original'
DATA_FINAL_DIR = 'data/final'

# --- Pydantic Models ---
class SimulationInput(BaseModel):
    production_volume_kg: float = Field(..., description="Total salt production volume")
    production_capacity_kg: float = Field(None, description="Salt production capacity. If not provided, estimated from production volume")
    rain_sum_mm: float = Field(..., description="Total monthly rainfall")
    temperature_mean_c: float = Field(..., description="Average monthly temperature")
    humidity_mean_percent: float = Field(..., description="Average monthly relative humidity")
    wind_speed_mean_kmh: float = Field(..., description="Average monthly wind speed")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "production_volume_kg": 50000.0,
                    "production_capacity_kg": 62500.0,
                    "rain_sum_mm": 100.0,
                    "temperature_mean_c": 28.0,
                    "humidity_mean_percent": 75.0,
                    "wind_speed_mean_kmh": 15.0
                }
            ]
        }
    }

class SimulationOutput(BaseModel):
    Total_Waste_kg: float = Field(..., description="Total predicted solid waste mass", title="Total Waste (kg)")
    Solid_Waste_Limestone_kg: float = Field(..., description="Predicted Limestone waste mass", title="Limestone (kg)")
    Solid_Waste_Gypsum_kg: float = Field(..., description="Predicted Gypsum waste mass", title="Gypsum (kg)")
    Solid_Waste_Industrial_Salt_kg: float = Field(..., description="Predicted Industrial Salt/Fines waste mass", title="Industrial Salt (kg)")
    Liquid_Waste_Bittern_Liters: float = Field(..., description="Predicted Bittern liquid volume", title="Bittern (L)")
    Potential_Epsom_Salt_kg: float = Field(..., description="Potential recoverable Epsom Salt mass", title="Epsom Salt Potential (kg)")
    Potential_Potash_kg: float = Field(..., description="Potential recoverable Potash mass", title="Potash Potential (kg)")
    Potential_Magnesium_Oil_Liters: float = Field(..., description="Potential recoverable Magnesium Oil volume", title="Magnesium Oil Potential (L)")

class DateRangeInput(BaseModel):
    start_date: str
    end_date: str

# --- Startup Event ---
@app.on_event("startup")
def load_model():
    global distributor
    print("Initializing Digital Twin Model...")
    
    # Initialize
    distributor = WasteDistributor(production_weight=1.0, rain_weight=0.5, temp_weight=0.1)
    
    # Load Data for Calibration
    try:
        monthly_features = pd.read_parquet(os.path.join(DATA_PROCESSED_DIR, 'monthly_features.parquet'))
        yearly_waste = pd.read_excel(os.path.join(DATA_ORIGINAL_DIR, 'actual_waste_data.xlsx'))
        
        # Calibrate
        distributor.calibrate(yearly_waste, monthly_features)
        print("Model initialized and calibrated successfully.")
    except Exception as e:
        print(f"Error initializing model: {e}")
        print("API will run, but predictions might fail if data is missing.")

# --- Endpoints ---

@app.get("/health", tags=["Health"])
def health_check():
    """
    Returns the health status of the API.
    """
    status = "healthy" if distributor and distributor.calibration_factor != 1.0 else "degraded (uncalibrated)"
    return {"status": status, "service": "Digital Twin API"}

@app.post("/predict/single", tags=["Simulation"], response_model=SimulationOutput)
def predict_single_month(input_data: SimulationInput):
    """
    Generates a data point (waste composition) for a single month based on inputs.
    """
    if not distributor:
        raise HTTPException(status_code=503, detail="Model not initialized")
        
    result = distributor.predict_one_month(
        production=input_data.production_volume_kg,
        rain=input_data.rain_sum_mm,
        temp=input_data.temperature_mean_c,
        humidity=input_data.humidity_mean_percent,
        wind=input_data.wind_speed_mean_kmh,
        production_capacity=input_data.production_capacity_kg
    )
    return result

@app.post("/simulate/range", tags=["Simulation"], response_model=List[SimulationOutput])
def simulate_range(date_range: DateRangeInput):
    """
    Simulates waste generation for a specified time period using historical weather/production data 
    and the calibrated physics model.
    """
    if not distributor:
        raise HTTPException(status_code=503, detail="Model not initialized")

    try:
        # Load features
        features_path = os.path.join(DATA_PROCESSED_DIR, 'monthly_features.parquet')
        if not os.path.exists(features_path):
             raise HTTPException(status_code=404, detail="Historical feature data not found.")
             
        df = pd.read_parquet(features_path)
        
        # Ensure date column
        if 'month_start' in df.columns:
            date_col = 'month_start'
        elif 'date' in df.columns:
            date_col = 'date'
        else:
             raise HTTPException(status_code=500, detail="Date column not found in feature data.")
             
        df[date_col] = pd.to_datetime(df[date_col])
        
        # Filter
        mask = (df[date_col] >= date_range.start_date) & (df[date_col] <= date_range.end_date)
        filtered_df = df.loc[mask]
        
        if filtered_df.empty:
            return []
            
        results = []
        for _, row in filtered_df.iterrows():
            # Map columns from parquet to model input
            # Parquet cols: production_volume, rain_sum, temperature_mean, humidity_mean, wind_speed_mean
            prediction = distributor.predict_one_month(
                production=row['production_volume'],
                rain=row['rain_sum'],
                temp=row['temperature_mean'],
                humidity=row['humidity_mean'],
                wind=row['wind_speed_mean']
            )
            results.append(prediction)
            
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/data/range", tags=["Data"])
def get_data_range(start_date: str, end_date: str):
    """
    Retrieves generated waste data for a specified time period from the historical dataset.
    Format: YYYY-MM-DD
    """
    try:
        file_path = os.path.join(DATA_FINAL_DIR, 'monthly_waste_composition.parquet')
        if not os.path.exists(file_path):
             raise HTTPException(status_code=404, detail="Generated dataset not found. Run the pipeline first.")
             
        df = pd.read_parquet(file_path)
        
        # Ensure date column is datetime
        # The parquet file has 'month_start' or 'date_prod'
        # Let's check columns. Based on previous output, 'month_start' is the clean monthly date.
        if 'month_start' in df.columns:
            date_col = 'month_start'
        elif 'date' in df.columns:
            date_col = 'date'
        else:
             raise HTTPException(status_code=500, detail="Date column not found in dataset.")
             
        df[date_col] = pd.to_datetime(df[date_col])
        
        # Filter
        mask = (df[date_col] >= start_date) & (df[date_col] <= end_date)
        filtered_df = df.loc[mask]
        
        if filtered_df.empty:
            return {"message": "No data found for this range", "data": []}
            
        # Convert to dict
        # Handle Timestamp objects for JSON serialization
        result = filtered_df.to_dict(orient='records')
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
