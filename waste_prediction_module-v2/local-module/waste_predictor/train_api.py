"""
Training API for Waste Predictor
================================
Provides MongoDB-based training functionality for the waste prediction model.
"""

import pandas as pd
from typing import Dict, Optional
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure

from .train import ProductionWastePredictor


def train_from_mongodb(
    mongo_uri: str,
    database: str,
    collection: str = "training",
    output_model_path: str = "waste_predictor_v4.pkl",
    username: Optional[str] = None,
    password: Optional[str] = None,
    auth_source: str = "admin",
    verbose: bool = True
) -> Dict:
    """
    Train the waste prediction model using data from MongoDB.
    
    Args:
        mongo_uri: MongoDB connection URI (e.g., 'mongodb://localhost:27017' or 'mongodb+srv://...')
        database: Database name to use
        collection: Collection name containing training data (default: 'training')
        output_model_path: Path where the trained model will be saved (default: 'waste_predictor_v4.pkl')
        username: MongoDB username (optional, can be in URI)
        password: MongoDB password (optional, can be in URI)
        auth_source: Authentication database (default: 'admin')
        verbose: Print training progress (default: True)
    
    Returns:
        dict: Training results with metrics and model information
        
    Raises:
        ConnectionFailure: If cannot connect to MongoDB
        ValueError: If data validation fails
        
    Example:
        >>> from waste_predictor import train_from_mongodb
        >>> 
        >>> # Simple local connection
        >>> results = train_from_mongodb(
        ...     mongo_uri='mongodb://localhost:27017',
        ...     database='waste_db',
        ...     collection='training'
        ... )
        >>>
        >>> # With authentication
        >>> results = train_from_mongodb(
        ...     mongo_uri='mongodb+srv://cluster.mongodb.net',
        ...     database='waste_db',
        ...     username='user',
        ...     password='pass123',
        ...     collection='training'
        ... )
        >>>
        >>> print(f"Model R²: {results['metrics']['r2']:.4f}")
        >>> print(f"Model saved to: {results['model_path']}")
    """
    
    if verbose:
        print("=" * 70)
        print("WASTE PREDICTOR - MONGODB TRAINING")
        print("=" * 70)
    
    # Build connection string if credentials provided
    if username and password:
        # Parse the URI to inject credentials if needed
        if '://' in mongo_uri:
            protocol, rest = mongo_uri.split('://', 1)
            mongo_uri = f"{protocol}://{username}:{password}@{rest}"
    
    # Connect to MongoDB
    if verbose:
        print(f"\n📡 Connecting to MongoDB...")
        print(f"   URI: {mongo_uri.split('@')[-1] if '@' in mongo_uri else mongo_uri}")
        print(f"   Database: {database}")
        print(f"   Collection: {collection}")
    
    try:
        if username and password and '@' not in mongo_uri:
            client = MongoClient(
                mongo_uri,
                username=username,
                password=password,
                authSource=auth_source
            )
        else:
            client = MongoClient(mongo_uri)
        
        # Test connection
        client.admin.command('ping')
        
        if verbose:
            print("   ✅ Connected successfully!")
        
    except ConnectionFailure as e:
        raise ConnectionFailure(f"Failed to connect to MongoDB: {e}")
    except Exception as e:
        raise Exception(f"MongoDB connection error: {e}")
    
    # Access database and collection
    try:
        db = client[database]
        coll = db[collection]
        
        # Get document count
        doc_count = coll.count_documents({})
        
        if doc_count == 0:
            raise ValueError(f"Collection '{collection}' is empty. No training data found.")
        
        if verbose:
            print(f"\n📊 Loading training data...")
            print(f"   Documents found: {doc_count}")
        
        # Fetch all documents
        documents = list(coll.find())
        
        if verbose:
            print(f"   ✅ Loaded {len(documents)} documents")
        
    except OperationFailure as e:
        raise OperationFailure(f"Failed to access collection: {e}")
    finally:
        client.close()
    
    # Convert to DataFrame
    if verbose:
        print(f"\n🔄 Processing data...")
    
    df = pd.DataFrame(documents)
    
    # Remove MongoDB _id field if present
    if '_id' in df.columns:
        df = df.drop('_id', axis=1)
    
    # Validate required columns
    required_input_cols = [
        'production_volume',
        'rain_sum',
        'temperature_mean',
        'humidity_mean',
        'wind_speed_mean',
        'Month'
    ]
    
    required_output_cols = [
        'Total_Waste_kg',
        'Solid_Waste_Limestone_kg',
        'Solid_Waste_Gypsum_kg',
        'Solid_Waste_Industrial_Salt_kg',
        'Liquid_Waste_Bittern_Liters',
        'Potential_Epsom_Salt_kg',
        'Potential_Potash_kg',
        'Potential_Magnesium_Oil_Liters'
    ]
    
    missing_cols = []
    for col in required_input_cols + required_output_cols:
        if col not in df.columns:
            missing_cols.append(col)
    
    if missing_cols:
        raise ValueError(
            f"Missing required columns: {missing_cols}\n"
            f"Available columns: {list(df.columns)}"
        )
    
    # Rename Month to month for consistency with model
    if 'Month' in df.columns:
        df = df.rename(columns={'Month': 'month'})
    
    if verbose:
        print(f"   Rows: {len(df)}")
        print(f"   Features: {len(df.columns)}")
        print(f"   ✅ Data validation passed")
    
    # Train model
    if verbose:
        print(f"\n🚀 Starting model training...")
        print(f"   This may take several minutes...\n")
    
    model = ProductionWastePredictor()
    model.fit(df, verbose=verbose)
    
    # Save model
    if verbose:
        print(f"\n💾 Saving model...")
        print(f"   Path: {output_model_path}")
    
    model.save(output_model_path)
    
    if verbose:
        print(f"   ✅ Model saved successfully!")
    
    # Prepare results
    results = {
        'status': 'success',
        'model_path': output_model_path,
        'training_samples': len(df),
        'metrics': model.test_metrics,
        'feature_columns': list(df.columns)
    }
    
    if verbose:
        print("\n" + "=" * 70)
        print("TRAINING COMPLETED SUCCESSFULLY")
        print("=" * 70)
        print(f"\n📈 Final Metrics:")
        print(f"   R² Score: {results['metrics']['r2']:.4f}")
        print(f"   MAE: {results['metrics']['mae']:,.2f}")
        print(f"   RMSE: {results['metrics']['rmse']:,.2f}")
        print(f"\n💾 Model saved to: {output_model_path}")
        print(f"📦 Training samples: {results['training_samples']:,}")
    
    return results


def train_from_dataframe(
    df: pd.DataFrame,
    output_model_path: str = "waste_predictor_v4.pkl",
    verbose: bool = True
) -> Dict:
    """
    Train the waste prediction model using a pandas DataFrame.
    
    Args:
        df: DataFrame containing training data
        output_model_path: Path where the trained model will be saved
        verbose: Print training progress
    
    Returns:
        dict: Training results with metrics
        
    Example:
        >>> import pandas as pd
        >>> from waste_predictor import train_from_dataframe
        >>> 
        >>> df = pd.read_csv('training_data.csv')
        >>> results = train_from_dataframe(df)
        >>> print(f"Model R²: {results['metrics']['r2']:.4f}")
    """
    
    if verbose:
        print("=" * 70)
        print("WASTE PREDICTOR - DATAFRAME TRAINING")
        print("=" * 70)
        print(f"\n📊 Training samples: {len(df)}")
    
    # Train model
    model = ProductionWastePredictor()
    model.fit(df, verbose=verbose)
    
    # Save model
    if verbose:
        print(f"\n💾 Saving model to: {output_model_path}")
    
    model.save(output_model_path)
    
    results = {
        'status': 'success',
        'model_path': output_model_path,
        'training_samples': len(df),
        'metrics': model.test_metrics
    }
    
    if verbose:
        print("\n" + "=" * 70)
        print("TRAINING COMPLETED SUCCESSFULLY")
        print("=" * 70)
        print(f"\n📈 Final Metrics:")
        print(f"   R² Score: {results['metrics']['r2']:.4f}")
        print(f"   MAE: {results['metrics']['mae']:,.2f}")
        print(f"   RMSE: {results['metrics']['rmse']:,.2f}")
    
    return results
