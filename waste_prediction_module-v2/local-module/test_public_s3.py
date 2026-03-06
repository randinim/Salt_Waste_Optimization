"""
Test Public S3 Access (No Credentials Needed)
==============================================

This demonstrates how to use the S3 update feature with publicly accessible buckets.
"""

from waste_predictor import update_model_from_s3


def test_public_bucket():
    """Test downloading from a public S3 bucket without credentials."""
    
    print("\n" + "="*60)
    print("PUBLIC S3 BUCKET TEST - NO CREDENTIALS NEEDED")
    print("="*60)
    
    # Example with a public bucket
    # Replace these with your actual public bucket details
    BUCKET_NAME = 'your-public-bucket-name'
    S3_KEY = 'models/waste_predictor_v5.pkl'
    REGION = 'us-east-1'
    
    print("\n📦 Downloading from public S3 bucket...")
    print(f"   Bucket: {BUCKET_NAME}")
    print(f"   Key: {S3_KEY}")
    print(f"   Region: {REGION}")
    print()
    
    # No credentials needed for public buckets!
    result = update_model_from_s3(
        bucket_name=BUCKET_NAME,
        s3_key=S3_KEY,
        region_name=REGION
        # Note: No aws_access_key_id or aws_secret_access_key needed!
    )
    
    if result['success']:
        print(f"\n✓ SUCCESS!")
        print(f"  {result['message']}")
        print(f"  Model Path: {result['model_path']}")
        print(f"  Backup: {result['backup_path']}")
        
    else:
        print(f"\n✗ FAILED!")
        print(f"  {result['message']}")
        
        # Common issues:
        if 'AccessDenied' in str(result.get('error', '')):
            print("\n💡 Tip: Make sure your S3 bucket is publicly accessible")
            print("   Check bucket policy allows s3:GetObject for public access")
        elif 'NoSuchBucket' in str(result.get('error', '')):
            print("\n💡 Tip: Check your bucket name is correct")
        elif 'NoSuchKey' in str(result.get('error', '')):
            print("\n💡 Tip: Check your S3 key path is correct")


def example_public_bucket_policy():
    """Show example public bucket policy."""
    
    print("\n" + "="*60)
    print("PUBLIC S3 BUCKET POLICY EXAMPLE")
    print("="*60)
    
    policy = """
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/models/*"
    }
  ]
}
"""
    
    print("\nTo make your S3 bucket publicly accessible:")
    print("\n1. Go to AWS S3 Console")
    print("2. Select your bucket")
    print("3. Go to 'Permissions' tab")
    print("4. Edit 'Bucket Policy'")
    print("5. Add this policy:\n")
    print(policy)
    print("\n⚠️  WARNING: This makes ALL files in the 'models/' folder public!")
    print("   Only use this for non-sensitive model files.")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("WASTE PREDICTOR - PUBLIC S3 BUCKET EXAMPLES")
    print("="*60)
    
    print("\n✨ ADVANTAGE: No AWS credentials needed!")
    print("   Perfect for:")
    print("   - Open source models")
    print("   - Public model repositories")
    print("   - Simplified deployment (no credential management)")
    
    # Show example bucket policy
    example_public_bucket_policy()
    
    # Uncomment to test with your public bucket
    # test_public_bucket()
    
    print("\n" + "="*60)
    print("Update BUCKET_NAME and S3_KEY, then uncomment test")
    print("="*60 + "\n")
