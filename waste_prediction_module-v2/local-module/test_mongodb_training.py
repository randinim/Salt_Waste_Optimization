"""
Test MongoDB Training with Real Database
=========================================
Tests the train_from_mongodb function with your MongoDB Atlas instance.
"""

from waste_predictor import train_from_mongodb

# Your MongoDB Atlas connection details
MONGODB_URL = "mongodb+srv://malaka:malaka_rodrigo@cluster0.bkhgndo.mongodb.net/?appName=Cluster0"
DATABASE_NAME = "factory_A"  # Change this to your actual database name
COLLECTION_NAME = "training"  # Change this to your actual collection name

def test_mongodb_training():
    """Test training from MongoDB"""
    
    print("=" * 70)
    print("TESTING MONGODB TRAINING")
    print("=" * 70)
    print(f"\n📡 Connecting to MongoDB Atlas...")
    print(f"   Database: {DATABASE_NAME}")
    print(f"   Collection: {COLLECTION_NAME}")
    print()
    
    try:
        # Train the model
        results = train_from_mongodb(
            mongo_uri=MONGODB_URL,
            database=DATABASE_NAME,
            collection=COLLECTION_NAME,
            output_model_path='test_trained_model.pkl',
            verbose=True
        )
        
        print("\n" + "=" * 70)
        print("✅ TRAINING TEST SUCCESSFUL!")
        print("=" * 70)
        print(f"\n📊 Results:")
        print(f"   Status: {results['status']}")
        print(f"   Training samples: {results['training_samples']:,}")
        print(f"   Model saved to: {results['model_path']}")
        print(f"\n📈 Performance Metrics:")
        print(f"   R² Score: {results['metrics']['r2']:.4f}")
        print(f"   MAE: {results['metrics']['mae']:,.2f}")
        print(f"   RMSE: {results['metrics']['rmse']:,.2f}")
        
        print("\n✅ Your MongoDB training is working perfectly!")
        
        return results
        
    except Exception as e:
        print("\n" + "=" * 70)
        print("❌ TRAINING TEST FAILED")
        print("=" * 70)
        print(f"\nError: {e}")
        print("\n💡 Troubleshooting steps:")
        print("1. Verify your database name is correct")
        print("2. Verify your collection name is correct")
        print("3. Check that the collection has training data")
        print("4. Ensure your MongoDB user has read permissions")
        print("\nTo check your collections, you can use:")
        print("   - MongoDB Compass")
        print("   - MongoDB Atlas web interface")
        print("   - Or run: db.getCollectionNames() in MongoDB shell")
        raise

if __name__ == '__main__':
    print("\n" + "⚙️  " * 20)
    print("\nNOTE: Before running this test:")
    print("1. Update DATABASE_NAME if needed (currently: '{}')".format(DATABASE_NAME))
    print("2. Update COLLECTION_NAME if needed (currently: '{}')".format(COLLECTION_NAME))
    print("3. Ensure your collection has the required training data")
    print("\n" + "⚙️  " * 20)
    
    input("\nPress Enter to start training test, or Ctrl+C to cancel...")
    
    test_mongodb_training()
