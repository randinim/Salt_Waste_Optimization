"""
Example: Training Waste Predictor from MongoDB
===============================================

This script demonstrates how to train the waste prediction model
using data stored in MongoDB.

MongoDB Document Format:
{
  "Year": 2000,
  "Month": 1,
  "production_volume": 43163.99,
  "rain_sum": 270.87,
  "temperature_mean": 26.53,
  "humidity_mean": 100,
  "wind_speed_mean": 19.68,
  "Total_Waste_kg": 96664.3838,
  "Solid_Waste_Limestone_kg": 5080.5243,
  "Solid_Waste_Gypsum_kg": 23189.168,
  "Solid_Waste_Industrial_Salt_kg": 68394.6915,
  "Liquid_Waste_Bittern_Liters": 31725.5458,
  "Potential_Epsom_Salt_kg": 1605.914,
  "Potential_Potash_kg": 206.5851,
  "Potential_Magnesium_Oil_Liters": 3163.2316
}
"""

from waste_predictor import train_from_mongodb


def train_example_local():
    """Example: Training with local MongoDB instance"""
    print("=" * 70)
    print("EXAMPLE 1: Training with Local MongoDB")
    print("=" * 70)
    
    results = train_from_mongodb(
        mongo_uri='mongodb://localhost:27017',
        database='waste_db',
        collection='training',
        output_model_path='my_custom_model.pkl',
        verbose=True
    )
    
    print("\n✅ Training completed!")
    print(f"Model saved to: {results['model_path']}")
    print(f"R² Score: {results['metrics']['r2']:.4f}")
    print(f"MAE: {results['metrics']['mae']:,.2f}")
    

def train_example_cloud():
    """Example: Training with MongoDB Atlas (cloud)"""
    print("\n" + "=" * 70)
    print("EXAMPLE 2: Training with MongoDB Atlas")
    print("=" * 70)
    
    # Replace with your actual MongoDB Atlas credentials
    MONGO_URI = "mongodb+srv://cluster.mongodb.net"
    USERNAME = "your_username"
    PASSWORD = "your_password"
    DATABASE = "waste_db"
    
    results = train_from_mongodb(
        mongo_uri=MONGO_URI,
        database=DATABASE,
        username=USERNAME,
        password=PASSWORD,
        collection='training',
        output_model_path='waste_predictor_cloud.pkl',
        verbose=True
    )
    
    print("\n✅ Training completed!")
    print(f"Model R² Score: {results['metrics']['r2']:.4f}")
    

def train_example_connection_string():
    """Example: Training with full connection string"""
    print("\n" + "=" * 70)
    print("EXAMPLE 3: Training with Full Connection String")
    print("=" * 70)
    
    # Full connection string with credentials
    CONNECTION_STRING = "mongodb+srv://username:password@cluster.mongodb.net/waste_db?retryWrites=true&w=majority"
    
    results = train_from_mongodb(
        mongo_uri=CONNECTION_STRING,
        database='waste_db',
        collection='training',
        verbose=True
    )
    
    print("\n✅ Training completed!")
    

def main():
    """
    Run training examples
    
    NOTE: Uncomment the example you want to run and update 
    the credentials with your actual MongoDB details.
    """
    
    # Example 1: Local MongoDB
    # train_example_local()
    
    # Example 2: MongoDB Atlas with separate credentials
    # train_example_cloud()
    
    # Example 3: Full connection string
    # train_example_connection_string()
    
    print("\n" + "=" * 70)
    print("INSTRUCTIONS")
    print("=" * 70)
    print("""
To use MongoDB training:

1. Make sure MongoDB is accessible and contains training data
2. Update the connection details in the examples above
3. Uncomment one of the training examples
4. Run this script

Required MongoDB Document Fields:
    - production_volume
    - rain_sum
    - temperature_mean
    - humidity_mean
    - wind_speed_mean
    - Month
    - Total_Waste_kg
    - Solid_Waste_Limestone_kg
    - Solid_Waste_Gypsum_kg
    - Solid_Waste_Industrial_Salt_kg
    - Liquid_Waste_Bittern_Liters
    - Potential_Epsom_Salt_kg
    - Potential_Potash_kg
    - Potential_Magnesium_Oil_Liters

After training, use the model for predictions:
    from waste_predictor import get_waste_prediction
    
    result = get_waste_prediction({
        'production_volume': 50000,
        'rain_sum': 200,
        'temperature_mean': 28,
        'humidity_mean': 85,
        'wind_speed_mean': 15,
        'month': 6
    })
    """)


if __name__ == '__main__':
    main()
