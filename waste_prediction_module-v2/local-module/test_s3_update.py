"""
Test S3 Model Update Functionality
===================================

This script demonstrates how to use the S3 model update feature.
"""

from waste_predictor import update_model_from_s3, restore_model_from_backup, get_waste_prediction


def test_s3_update():
    """Test updating model from S3."""
    
    print("\n" + "="*60)
    print("S3 MODEL UPDATE TEST")
    print("="*60)
    
    # TODO: Replace with your actual S3 details
    BUCKET_NAME = 'your-bucket-name'
    S3_KEY = 'models/waste_predictor_v5.pkl'
    AWS_ACCESS_KEY = 'YOUR_ACCESS_KEY_ID'
    AWS_SECRET_KEY = 'YOUR_SECRET_ACCESS_KEY'
    REGION = 'us-east-1'
    
    print("\n1. Testing S3 Model Update")
    print("-" * 60)
    
    result = update_model_from_s3(
        bucket_name=BUCKET_NAME,
        s3_key=S3_KEY,
        aws_access_key_id=AWS_ACCESS_KEY,
        aws_secret_access_key=AWS_SECRET_KEY,
        region_name=REGION,
        validate_model=True,
        backup_old_model=True
    )
    
    if result['success']:
        print(f"✓ SUCCESS: {result['message']}")
        print(f"  Model Path: {result['model_path']}")
        print(f"  Metadata Path: {result.get('metadata_path', 'Not downloaded')}")
        print(f"  Backup Path: {result['backup_path']}")
        print(f"  S3 Source: {result['s3_source']}")
        
        # Test prediction with new model
        print("\n2. Testing Prediction with New Model")
        print("-" * 60)
        
        try:
            prediction = get_waste_prediction({
                'production_volume': 50000,
                'rain_sum': 200,
                'temperature_mean': 28,
                'humidity_mean': 85,
                'wind_speed_mean': 15,
                'month': 6
            })
            
            print(f"✓ Prediction successful!")
            print(f"  Total Waste: {prediction['Total_Waste_kg']:,.2f} kg")
            print(f"  Limestone: {prediction['Solid_Waste_Limestone_kg']:,.2f} kg")
            print(f"  Gypsum: {prediction['Solid_Waste_Gypsum_kg']:,.2f} kg")
            
        except Exception as e:
            print(f"✗ Prediction failed: {e}")
            
    else:
        print(f"✗ FAILED: {result['message']}")
        if 'error' in result:
            print(f"  Error: {result['error']}")


def test_restore_backup():
    """Test restoring model from backup."""
    
    print("\n3. Testing Backup Restoration")
    print("-" * 60)
    
    result = restore_model_from_backup()
    
    if result['success']:
        print(f"✓ SUCCESS: {result['message']}")
        print(f"  Model Path: {result['model_path']}")
        print(f"  Backup Path: {result['backup_path']}")
    else:
        print(f"✗ FAILED: {result['message']}")


def example_with_iam_role():
    """Example using IAM role (no credentials needed)."""
    
    print("\n" + "="*60)
    print("EXAMPLE: Using IAM Role (EC2/Lambda)")
    print("="*60)
    
    # When running on AWS with IAM role, no credentials needed
    result = update_model_from_s3(
        bucket_name='your-bucket-name',
        s3_key='models/waste_predictor_v5.pkl'
    )
    
    print(result)


def example_workflow():
    """Example: Complete update workflow with error handling."""
    
    print("\n" + "="*60)
    print("COMPLETE WORKFLOW EXAMPLE")
    print("="*60)
    
    # Configuration
    config = {
        'bucket_name': 'waste-models',
        's3_key': 'production/waste_predictor_v5.pkl',
        'aws_access_key_id': 'YOUR_KEY',
        'aws_secret_access_key': 'YOUR_SECRET',
        'region_name': 'us-east-1'
    }
    
    # Step 1: Update model
    print("\nStep 1: Downloading and updating model from S3...")
    update_result = update_model_from_s3(**config)
    
    if not update_result['success']:
        print(f"✗ Update failed: {update_result['message']}")
        return
    
    print(f"✓ {update_result['message']}")
    
    # Step 2: Validate with test prediction
    print("\nStep 2: Validating new model...")
    test_data = {
        'production_volume': 50000,
        'rain_sum': 200,
        'temperature_mean': 28,
        'humidity_mean': 85,
        'wind_speed_mean': 15,
        'month': 6
    }
    
    try:
        prediction = get_waste_prediction(test_data)
        print(f"✓ Model validation passed")
        print(f"  Test prediction: {prediction['Total_Waste_kg']:,.0f} kg")
        
    except Exception as e:
        print(f"✗ Model validation failed: {e}")
        print("\nStep 3: Rolling back to previous model...")
        
        restore_result = restore_model_from_backup()
        if restore_result['success']:
            print(f"✓ {restore_result['message']}")
        else:
            print(f"✗ Restore failed: {restore_result['message']}")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("WASTE PREDICTOR - S3 MODEL UPDATE EXAMPLES")
    print("="*60)
    
    print("\nBEFORE RUNNING:")
    print("1. Update the S3 credentials in this script")
    print("2. Ensure you have a model file in your S3 bucket")
    print("3. Make sure boto3 is installed: pip install boto3")
    
    # Uncomment the test you want to run:
    
    # Test basic S3 update
    # test_s3_update()
    
    # Test backup restoration
    # test_restore_backup()
    
    # Example with IAM role
    # example_with_iam_role()
    
    # Complete workflow
    # example_workflow()
    
    print("\n" + "="*60)
    print("Uncomment the test you want to run in the main block")
    print("="*60 + "\n")
