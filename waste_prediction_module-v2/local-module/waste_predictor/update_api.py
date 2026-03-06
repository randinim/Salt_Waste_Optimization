"""
Model Update API - Download and replace model from S3
======================================================

Functions for downloading and updating the waste prediction model from S3.

Example:
    >>> from waste_predictor import update_model_from_s3
    >>> 
    >>> result = update_model_from_s3(
    ...     bucket_name='my-models',
    ...     s3_key='models/waste_predictor_v5.pkl',
    ...     aws_access_key_id='YOUR_KEY',
    ...     aws_secret_access_key='YOUR_SECRET',
    ...     region_name='us-east-1'
    ... )
    >>> print(result['message'])
"""

import os
import boto3
from botocore import UNSIGNED
from botocore.config import Config
import pickle
from typing import Dict, Optional
import shutil
from pathlib import Path


def update_model_from_s3(
    bucket_name: str,
    s3_key: str,
    model_filename: str = 'waste_predictor_v4.pkl',
    aws_access_key_id: Optional[str] = None,
    aws_secret_access_key: Optional[str] = None,
    region_name: str = 'us-east-1',
    validate_model: bool = True,
    backup_old_model: bool = True,
    update_metadata: bool = True
) -> Dict:
    """
    Download a new model from S3 and replace the current model.

    Args:
        bucket_name: S3 bucket name
        s3_key: S3 object key (path to the model file)
        model_filename: Name of the model file to replace (default: 'waste_predictor_v4.pkl')
        aws_access_key_id: AWS access key ID (optional - not needed for public buckets)
        aws_secret_access_key: AWS secret access key (optional)
        region_name: AWS region (default: 'us-east-1')
        validate_model: Validate the model before replacing (default: True)
        backup_old_model: Create backup of old model before replacing (default: True)
        update_metadata: Also download and update metadata.json file (default: True)

    Returns:
        Dictionary with status and details:
        {
            'success': True/False,
            'message': 'Description of what happened',
            'model_path': 'Path to the updated model',
            'metadata_path': 'Path to metadata file (if downloaded)',
            'backup_path': 'Path to backup (if created)',
            's3_source': 'S3 URI of source'
        }

    Authentication:
        - If credentials provided: Uses those credentials
        - If no credentials: Tries anonymous access for public buckets
        - Falls back to: IAM role or AWS environment variables

    Example:
        >>> # From public S3 bucket (no credentials needed)
        >>> result = update_model_from_s3(
        ...     bucket_name='my-public-bucket',
        ...     s3_key='models/waste_predictor_v5.pkl'
        ... )
        
        >>> # Using AWS credentials (private bucket)
        >>> result = update_model_from_s3(
        ...     bucket_name='my-models-bucket',
        ...     s3_key='models/waste_predictor_v5.pkl',
        ...     aws_access_key_id='YOUR_KEY',
        ...     aws_secret_access_key='YOUR_SECRET'
        ... )
        
        >>> # Using IAM role (EC2/Lambda - no credentials needed)
        >>> result = update_model_from_s3(
        ...     bucket_name='my-models-bucket',
        ...     s3_key='models/waste_predictor_v5.pkl'
        ... )
        
        >>> print(result['message'])
        >>> # "Model successfully updated from s3://my-models-bucket/models/waste_predictor_v5.pkl"
    """
    
    try:
        # Get the package directory
        package_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(package_dir, model_filename)
        
        # Create S3 client
        # If no credentials provided, use unsigned requests (for public S3 buckets)
        if aws_access_key_id and aws_secret_access_key:
            # Use provided credentials
            s3_client = boto3.client(
                's3',
                aws_access_key_id=aws_access_key_id,
                aws_secret_access_key=aws_secret_access_key,
                region_name=region_name
            )
            print(f"Using provided AWS credentials")
        else:
            # Try unsigned access first (for public buckets)
            # If that fails, fall back to default credentials (IAM role/env vars)
            try:
                s3_client = boto3.client(
                    's3',
                    region_name=region_name,
                    config=Config(signature_version=UNSIGNED)
                )
                print(f"Using anonymous access (public bucket)")
            except Exception:
                # Fall back to default credential chain (IAM role, env vars, etc.)
                s3_client = boto3.client('s3', region_name=region_name)
                print(f"Using default AWS credentials (IAM role/environment)")
        
        # Download to temporary file first
        temp_path = os.path.join(package_dir, f'.{model_filename}.tmp')
        
        print(f"Downloading model from s3://{bucket_name}/{s3_key}...")
        s3_client.download_file(bucket_name, s3_key, temp_path)
        print(f"✓ Downloaded to temporary location")
        
        # Validate the model if requested
        if validate_model:
            print("Validating downloaded model...")
            try:
                # Import CompatibilityUnpickler for validation
                from .predict import CompatibilityUnpickler
                
                with open(temp_path, 'rb') as f:
                    data = CompatibilityUnpickler(f).load()
                
                # Check if it has the required structure
                if not isinstance(data, dict):
                    raise ValueError("Model file doesn't contain a dictionary")
                
                if 'models' not in data or 'weights' not in data:
                    raise ValueError("Model file missing required keys: 'models' and 'weights'")
                
                print(f"✓ Model validation passed")
                print(f"  - Found {len(data.get('models', []))} sub-models")
                print(f"  - Feature count: {len(data.get('feature_names', []))}")
                
            except Exception as e:
                # Clean up temp file
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                return {
                    'success': False,
                    'message': f'Model validation failed: {str(e)}',
                    'error': str(e)
                }
        
        # Backup old model if requested
        backup_path = None
        if backup_old_model and os.path.exists(model_path):
            backup_path = model_path + '.backup'
            shutil.copy2(model_path, backup_path)
            print(f"✓ Created backup at {backup_path}")
        
        # Replace the model
        shutil.move(temp_path, model_path)
        print(f"✓ Model updated successfully")
        
        # Download and update metadata file if requested
        metadata_path = None
        if update_metadata:
            try:
                # Derive metadata filename from model filename
                # e.g., waste_predictor_v4.pkl -> waste_predictor_v4_metadata.json
                base_name = model_filename.replace('.pkl', '')
                metadata_filename = f"{base_name}_metadata.json"
                metadata_path = os.path.join(package_dir, metadata_filename)
                
                # Derive S3 key for metadata
                # e.g., models/waste_predictor_v5.pkl -> models/waste_predictor_v5_metadata.json
                metadata_s3_key = s3_key.replace('.pkl', '_metadata.json')
                
                print(f"Downloading metadata from s3://{bucket_name}/{metadata_s3_key}...")
                temp_metadata_path = os.path.join(package_dir, f'.{metadata_filename}.tmp')
                
                s3_client.download_file(bucket_name, metadata_s3_key, temp_metadata_path)
                print(f"✓ Downloaded metadata file")
                
                # Backup old metadata if requested
                if backup_old_model and os.path.exists(metadata_path):
                    metadata_backup = metadata_path + '.backup'
                    shutil.copy2(metadata_path, metadata_backup)
                    print(f"✓ Created metadata backup")
                
                # Replace metadata file
                shutil.move(temp_metadata_path, metadata_path)
                print(f"✓ Metadata updated successfully")
                
            except Exception as e:
                # Metadata is optional - don't fail if it doesn't exist
                print(f"⚠ Metadata file not found or failed to download: {str(e)}")
                print(f"  Continuing without metadata update...")
                metadata_path = None
        
        s3_uri = f"s3://{bucket_name}/{s3_key}"
        
        return {
            'success': True,
            'message': f'Model successfully updated from {s3_uri}',
            'model_path': model_path,
            'metadata_path': metadata_path,
            'backup_path': backup_path,
            's3_source': s3_uri
        }
        
    except Exception as e:
        return {
            'success': False,
            'message': f'Failed to update model: {str(e)}',
            'error': str(e)
        }


def restore_model_from_backup(model_filename: str = 'waste_predictor_v4.pkl', restore_metadata: bool = True) -> Dict:
    """
    Restore model from backup file.

    Args:
        model_filename: Name of the model file to restore
        restore_metadata: Also restore metadata file if backup exists (default: True)

    Returns:
        Dictionary with status and message
    """
    try:
        package_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(package_dir, model_filename)
        backup_path = model_path + '.backup'
        
        if not os.path.exists(backup_path):
            return {
                'success': False,
                'message': f'No backup found at {backup_path}'
            }
        
        shutil.copy2(backup_path, model_path)
        print(f"✓ Model restored from backup")
        
        # Also restore metadata if requested
        metadata_path = None
        if restore_metadata:
            base_name = model_filename.replace('.pkl', '')
            metadata_filename = f"{base_name}_metadata.json"
            metadata_path = os.path.join(package_dir, metadata_filename)
            metadata_backup = metadata_path + '.backup'
            
            if os.path.exists(metadata_backup):
                shutil.copy2(metadata_backup, metadata_path)
                print(f"✓ Metadata restored from backup")
            else:
                print(f"⚠ No metadata backup found")
                metadata_path = None
        
        return {
            'success': True,
            'message': f'Model restored from backup',
            'model_path': model_path,
            'metadata_path': metadata_path,
            'backup_path': backup_path
        }
        
    except Exception as e:
        return {
            'success': False,
            'message': f'Failed to restore model: {str(e)}',
            'error': str(e)
        }
