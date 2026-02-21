"""
Quick test to verify training API is accessible
"""

try:
    from waste_predictor import train_from_mongodb, train_from_dataframe, get_waste_prediction
    print("✅ All imports successful!")
    print("\nAvailable functions:")
    print("  - get_waste_prediction() : Make predictions")
    print("  - train_from_mongodb() : Train from MongoDB")
    print("  - train_from_dataframe() : Train from pandas DataFrame")
    
    # Test prediction works
    print("\n" + "="*50)
    print("Testing prediction...")
    result = get_waste_prediction({
        'production_volume': 50000,
        'rain_sum': 200,
        'temperature_mean': 28,
        'humidity_mean': 85,
        'wind_speed_mean': 15,
        'month': 6
    })
    print("✅ Prediction successful!")
    print(f"   Total Waste: {result['Total_Waste_kg']:,.2f} kg")
    
    print("\n" + "="*50)
    print("✅ waste_predictor package is ready!")
    print("\nTo train from MongoDB, use:")
    print("""
from waste_predictor import train_from_mongodb

results = train_from_mongodb(
    mongo_uri='mongodb://localhost:27017',
    database='your_database',
    collection='training'
)
    """)
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("\nTry reinstalling the package:")
    print("  pip install -e .")
except Exception as e:
    print(f"❌ Error: {e}")
