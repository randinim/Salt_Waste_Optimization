import torch
import torch.nn as nn
import torch.optim as optim
import pandas as pd
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from model import WastePredictor

def train():
    # Load data
    data_path = os.path.join('data', 'training', 'training.csv')
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found.")
        return

    df = pd.read_csv(data_path)
    
    # Define input and output columns
    input_cols = ['production_volume', 'rain_sum', 'temperature_mean', 'humidity_mean', 'wind_speed_mean']
    output_cols = [
        'Total_Waste_kg', 
        'Solid_Waste_Limestone_kg', 
        'Solid_Waste_Gypsum_kg', 
        'Solid_Waste_Industrial_Salt_kg', 
        'Liquid_Waste_Bittern_Liters', 
        'Potential_Epsom_Salt_kg', 
        'Potential_Potash_kg', 
        'Potential_Magnesium_Oil_Liters'
    ]
    
    X = torch.tensor(df[input_cols].values, dtype=torch.float32)
    y = torch.tensor(df[output_cols].values, dtype=torch.float32)

    # Split data 90:10
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, random_state=42)
    
    # Initialize model
    model = WastePredictor(input_dim=len(input_cols), output_dim=len(output_cols))
    
    # Calculate and set normalization statistics (using only training data)
    input_mean = X_train.mean(dim=0)
    input_std = X_train.std(dim=0)
    model.input_mean.copy_(input_mean)
    model.input_std.copy_(input_std)
    
    # Training setup
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.01)
    epochs = 1000
    
    print("Starting training...")
    for epoch in range(epochs):
        optimizer.zero_grad()
        outputs = model(X_train)
        loss = criterion(outputs, y_train)
        loss.backward()
        optimizer.step()
        
        if (epoch + 1) % 100 == 0:
            print(f'Epoch [{epoch+1}/{epochs}], Loss: {loss.item():.4f}')
            
    # Evaluation on Test Set
    model.eval()
    with torch.no_grad():
        test_outputs = model(X_test)
        test_loss = criterion(test_outputs, y_test)
        
        # Convert to numpy for sklearn metrics
        y_test_np = y_test.numpy()
        test_outputs_np = test_outputs.numpy()
        
        r2 = r2_score(y_test_np, test_outputs_np)
        mae = mean_absolute_error(y_test_np, test_outputs_np)
        mse = mean_squared_error(y_test_np, test_outputs_np)
        
        print("\n--- Test Set Performance (90:10 Split) ---")
        print(f"Test MSE Loss: {test_loss.item():.4f}")
        print(f"Mean Absolute Error (MAE): {mae:.4f}")
        print(f"R2 Score (Overall): {r2:.4f}")
        
        # Per-target R2
        r2_per_target = r2_score(y_test_np, test_outputs_np, multioutput='raw_values')
        print("\nR2 Score per Target:")
        for i, col in enumerate(output_cols):
            print(f"  {col}: {r2_per_target[i]:.4f}")

    # Save full model (including buffers for normalization)
    torch.save(model, 'waste_predictor.pt')
    print("\nFull model (with normalization) saved to waste_predictor.pt")

if __name__ == '__main__':
    train()
