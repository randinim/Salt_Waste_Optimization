"""
MongoDB Database Inspector
===========================
Helps you inspect your MongoDB database to find the correct database 
and collection names for training.
"""

from pymongo import MongoClient

# Your MongoDB Atlas connection
MONGODB_URL = "mongodb+srv://malaka:malaka_rodrigo@cluster0.bkhgndo.mongodb.net/?appName=Cluster0"

def inspect_mongodb():
    """Inspect MongoDB to find databases and collections"""
    
    print("=" * 70)
    print("MONGODB DATABASE INSPECTOR")
    print("=" * 70)
    
    try:
        # Connect to MongoDB
        print("\n📡 Connecting to MongoDB Atlas...")
        client = MongoClient(MONGODB_URL)
        
        # Test connection
        client.admin.command('ping')
        print("✅ Connected successfully!\n")
        
        # List all databases
        print("=" * 70)
        print("AVAILABLE DATABASES")
        print("=" * 70)
        databases = client.list_database_names()
        
        for db_name in databases:
            # Skip system databases
            if db_name in ['admin', 'local', 'config']:
                continue
                
            print(f"\n📁 Database: {db_name}")
            db = client[db_name]
            collections = db.list_collection_names()
            
            if collections:
                print(f"   Collections:")
                for coll_name in collections:
                    coll = db[coll_name]
                    count = coll.count_documents({})
                    print(f"      - {coll_name} ({count:,} documents)")
                    
                    # Show sample document structure
                    if count > 0:
                        sample = coll.find_one()
                        print(f"        Sample fields: {list(sample.keys())[:10]}")
            else:
                print(f"   (No collections)")
        
        print("\n" + "=" * 70)
        print("INSPECTION COMPLETE")
        print("=" * 70)
        print("\n💡 Next steps:")
        print("1. Choose the database name from the list above")
        print("2. Choose the collection that contains your training data")
        print("3. Update test_mongodb_training.py with these values")
        print("4. Run: python test_mongodb_training.py")
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nPossible issues:")
        print("- Check your internet connection")
        print("- Verify MongoDB Atlas credentials")
        print("- Ensure IP address is whitelisted in Atlas")

if __name__ == '__main__':
    inspect_mongodb()
