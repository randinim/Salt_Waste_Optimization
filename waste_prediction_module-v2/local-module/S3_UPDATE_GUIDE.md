# S3 Model Update Guide

The waste-predictor package now supports downloading and updating models directly from AWS S3.

## Installation

Make sure you have the latest version with S3 support:

```bash
pip install waste-predictor>=4.0.4
```

## Basic Usage

### Option 1: Public S3 Bucket (No Credentials Needed!) ⭐

**Perfect for open-source models or public model repositories.**

If your S3 bucket is publicly accessible, you don't need ANY AWS credentials:

```python
from waste_predictor import update_model_from_s3

# Just bucket name and key - that's it!
# Automatically downloads both model.pkl AND metadata.json
result = update_model_from_s3(
    bucket_name='my-public-bucket',
    s3_key='models/waste_predictor_v5.pkl'
)

if result['success']:
    print(result['message'])
    print(f"Model: {result['model_path']}")
    print(f"Metadata: {result['metadata_path']}")
else:
    print(f"Error: {result['message']}")
```

**What gets downloaded:**
- ✅ Model file: `models/waste_predictor_v5.pkl`
- ✅ Metadata file: `models/waste_predictor_v5_metadata.json` (if exists)
- ✅ Both files are backed up automatically before replacement

**Advantages:**
- ✅ No credential management needed
- ✅ Works anywhere (no AWS account required)
- ✅ Perfect for public/open-source models
- ✅ Simplified deployment

**How to make your S3 bucket public:**

See the "Making Your S3 Bucket Public" section below for bucket policy details.

### Option 2: With AWS Credentials (Private Buckets)

```python
from waste_predictor import update_model_from_s3

result = update_model_from_s3(
    bucket_name='my-models-bucket',
    s3_key='models/waste_predictor_v5.pkl',
    aws_access_key_id='YOUR_ACCESS_KEY_ID',
    aws_secret_access_key='YOUR_SECRET_ACCESS_KEY',
    region_name='us-east-1'
)

if result['success']:
    print(result['message'])
    print(f"Model path: {result['model_path']}")
    print(f"Backup: {result['backup_path']}")
else:
    print(f"Error: {result['message']}")
```

### Option 3: Using IAM Role (EC2/Lambda)

If running on AWS infrastructure with IAM roles, you don't need to provide credentials:

```python
from waste_predictor import update_model_from_s3

result = update_model_from_s3(
    bucket_name='my-models-bucket',
    s3_key='models/waste_predictor_v5.pkl'
)
```

### Option 3: Using AWS Environment Variables

Set environment variables and use without credentials:

```bash
export AWS_ACCESS_KEY_ID=your_key_id
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

```python
from waste_predictor import update_model_from_s3

result = update_model_from_s3(
    bucket_name='my-models-bucket',
    s3_key='models/waste_predictor_v5.pkl'
)
```

## Advanced Options

### Custom Model Filename

Update a specific model file:

```python
result = update_model_from_s3(
    bucket_name='my-bucket',
    s3_key='models/custom_model.pkl',
    model_filename='custom_waste_model.pkl'
)
```

### Skip Model Validation

Download without validation (faster but risky):

```python
result = update_model_from_s3(
    bucket_name='my-bucket',
    s3_key='models/new_model.pkl',
    validate_model=False
)
```

### Disable Backup

Don't create backup of old model:

```python
result = update_model_from_s3(
    bucket_name='my-bucket',
    s3_key='models/new_model.pkl',
    backup_old_model=False
)
```

## Metadata File Handling

**The package automatically downloads and updates both model and metadata files!**

### Default Behavior

When you download `waste_predictor_v5.pkl`, it also downloads `waste_predictor_v5_metadata.json`:

```python
result = update_model_from_s3(
    bucket_name='my-bucket',
    s3_key='models/waste_predictor_v5.pkl'
    # update_metadata=True is the default
)

# Check what was downloaded
print(f"Model: {result['model_path']}")
print(f"Metadata: {result['metadata_path']}")
```

### Skip Metadata Update

To only update the model file without metadata:

```python
result = update_model_from_s3(
    bucket_name='my-bucket',
    s3_key='models/new_model.pkl',
    update_metadata=False  # Skip metadata download
)
```

### S3 Naming Convention

The package expects this naming pattern:

```
S3 Bucket Structure:
models/
├── waste_predictor_v5.pkl              # Model file
└── waste_predictor_v5_metadata.json    # Metadata file (auto-detected)
```

**Note:** If the metadata file doesn't exist in S3, the update continues without error.

## Restore from Backup

If something goes wrong, restore the previous model:

```python
from waste_predictor import restore_model_from_backup

result = restore_model_from_backup()

if result['success']:
    print("Model restored successfully!")
else:
    print(f"Error: {result['message']}")
```

## Complete Workflow Example

```python
from waste_predictor import update_model_from_s3, get_waste_prediction, restore_model_from_backup

# 1. Update model from S3
print("Updating model from S3...")
result = update_model_from_s3(
    bucket_name='waste-models',
    s3_key='production/waste_predictor_v5.pkl',
    aws_access_key_id='YOUR_KEY',
    aws_secret_access_key='YOUR_SECRET'
)

if not result['success']:
    print(f"Update failed: {result['message']}")
    exit(1)

print(f"✓ {result['message']}")

# 2. Test the new model
try:
    test_prediction = get_waste_prediction({
        'production_volume': 50000,
        'rain_sum': 200,
        'temperature_mean': 28,
        'humidity_mean': 85,
        'wind_speed_mean': 15,
        'month': 6
    })
    
    print(f"✓ New model working: Total Waste = {test_prediction['Total_Waste_kg']:,.0f} kg")
    
except Exception as e:
    print(f"✗ New model failed: {e}")
    print("Restoring backup...")
    
    restore_result = restore_model_from_backup()
    if restore_result['success']:
        print("✓ Backup restored successfully")
    else:
        print(f"✗ Restore failed: {restore_result['message']}")
```

## Automated Model Updates

### Scheduled Updates (Linux/Mac with cron)

```bash
# Create update script: update_model.py
cat > update_model.py << 'EOF'
from waste_predictor import update_model_from_s3
import os

result = update_model_from_s3(
    bucket_name=os.environ['MODEL_BUCKET'],
    s3_key=os.environ['MODEL_KEY']
)
print(result['message'])
EOF

# Add to crontab (daily at 2 AM)
echo "0 2 * * * cd /path/to/app && python update_model.py >> update.log 2>&1" | crontab -
```

### Scheduled Updates (Windows Task Scheduler)

```python
# update_model.py
from waste_predictor import update_model_from_s3
import logging

logging.basicConfig(filename='model_update.log', level=logging.INFO)

result = update_model_from_s3(
    bucket_name='my-bucket',
    s3_key='models/latest.pkl'
)

logging.info(result['message'])
```

## S3 Bucket Setup

### Required Permissions

Your AWS IAM user/role needs these S3 permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

### Making Your S3 Bucket Public

**⭐ For public/open-source models - No AWS credentials needed!**

To allow anyone to download your models without AWS credentials:

#### Step 1: Disable "Block Public Access"

1. Go to AWS S3 Console
2. Select your bucket
3. Go to **Permissions** tab
4. Click **Edit** under "Block public access"
5. Uncheck "Block all public access"
6. Save changes

#### Step 2: Add Public Bucket Policy

Add this bucket policy to make specific files public:

```json
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
```

This makes all files under the `models/` folder publicly accessible.

#### Security Notes:

- ✅ **Safe:** Only files in specified path (e.g., `models/*`) are public
- ⚠️ **Warning:** Anyone can download these files
- 💡 **Best Practice:** Only use for non-sensitive model files
- 🔒 **Tip:** Use separate buckets for public vs. private models

#### Alternative: Public via URL

You can also share models using pre-signed URLs (valid for limited time):

```python
import boto3

s3 = boto3.client('s3')
url = s3.generate_presigned_url(
    'get_object',
    Params={'Bucket': 'my-bucket', 'Key': 'models/model.pkl'},
    ExpiresIn=3600  # 1 hour
)
print(url)  # Share this URL
```

### Recommended S3 Structure

```
s3://your-models-bucket/
├── production/
│   ├── waste_predictor_v4.pkl          # Current production model
│   ├── waste_predictor_v5.pkl          # New version
│   └── metadata.json                    # Model metadata
├── staging/
│   └── waste_predictor_test.pkl        # Test models
└── archive/
    ├── waste_predictor_v3.pkl          # Old versions
    └── waste_predictor_v2.pkl
```

## Response Format

All functions return a dictionary:

```python
{
    'success': True,                    # or False
    'message': 'Detailed status message',
    'model_path': '/path/to/model.pkl', # Local path to model
    'backup_path': '/path/to/backup',   # Backup path (if created)
    's3_source': 's3://bucket/key',     # S3 source URI
    'error': 'Error details'            # Only present if success=False
}
```

## Troubleshooting

### Error: "NoCredentialsError"

**Solution:** Provide AWS credentials or configure AWS CLI:
```bash
aws configure
```

### Error: "Model validation failed"

**Possible causes:**
- File is not a valid pickle file
- Missing required keys ('models', 'weights')
- Corrupted download

**Solution:** Check S3 file integrity or use `validate_model=False`

### Error: "Access Denied"

**Solution:** Check IAM permissions for S3 bucket access

### Error: "No backup found"

**Solution:** Backup only exists after first model update. You can't restore if no backup was created.

## Security Best Practices

1. **Never hardcode credentials** - Use environment variables or IAM roles
2. **Use S3 bucket policies** - Restrict access to specific IPs/roles
3. **Enable S3 versioning** - Keep history of model versions
4. **Use S3 encryption** - Enable server-side encryption for model files
5. **Audit access** - Enable CloudTrail logging for S3 access

## Next Steps

- Learn about [training models](TRAINING_GUIDE.md)
- See [prediction examples](README.md)
- Check [API reference](QUICK_REFERENCE.md)
