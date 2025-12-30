"""
Waste Composition Prediction API
=================================

Production-ready Flask API for waste composition prediction.
Provides RESTful endpoints for single and batch predictions.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from pathlib import Path
from datetime import datetime
import json

from train_model import WasteCompositionPredictor
from utils.validators import DataValidator

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Model initialization
MODEL_DIR = Path(__file__).parent / 'models'
OUTPUT_DIR = Path(__file__).parent / 'data' / 'predictions'
OUTPUT_DIR.mkdir(exist_ok=True, parents=True)

# Load model on startup
predictor = None

def init_model():
    """Initialize prediction model"""
    global predictor
    try:
        predictor = WasteCompositionPredictor(model_dir=str(MODEL_DIR))
        # Load pre-trained model
        predictor.model, predictor.scaler, predictor.feature_names, predictor.metadata = \
            predictor.model_manager.load_model()
        logger.info("✅ Model loaded successfully")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        return False


@app.before_request
def before_request():
    """Ensure model is loaded"""
    global predictor
    if predictor is None:
        if not init_model():
            return jsonify({'error': 'Model not available'}), 503

# Endpoint for health check
@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': predictor is not None
    }), 200

# Endpoint to get model information
@app.route('/model/info', methods=['GET'])
def model_info():
    """Get model information"""
    if predictor is None or predictor.metadata is None:
        return jsonify({'error': 'Model not loaded'}), 503
    
    return jsonify({
        'version': predictor.metadata.get('version', 'unknown'),
        'training_date': predictor.metadata.get('training_date'),
        'test_r2': predictor.metadata.get('test_r2'),
        'test_rmse': predictor.metadata.get('test_rmse'),
        'test_mae': predictor.metadata.get('test_mae'),
        'n_features': predictor.metadata.get('n_features'),
        'targets': predictor.target_names if predictor.target_names else []
    }), 200

# Endpoint for single prediction
@app.route('/predict', methods=['POST'])
def predict():
    """Single waste composition prediction
    
    Expected JSON:
    {
        "temperature_c": 28.0,
        "humidity_pct": 65.0,
        "rain_mm": 5.0,
        "wind_speed_kmh": 12.0,
        "production_volume": 1500.0,
        "evaporation_index": 45.0,
        "predicted_waste_bags": 250.0,
        "confidence": 0.85
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Map API field names to feature names
        input_data = {
            'Temperature (°C)': data.get('temperature_c'),
            'Humidity (%)': data.get('humidity_pct'),
            'Rain (mm)': data.get('rain_mm'),
            'Wind Speed (km/h)': data.get('wind_speed_kmh'),
            'Production Volume': data.get('production_volume'),
            'Evaporation Index': data.get('evaporation_index'),
            'Predicted Waste (bags)': data.get('predicted_waste_bags'),
            'Confidence': data.get('confidence', 0.8)
        }
        
        # Validate input
        if not DataValidator.validate_weather_data(input_data):
            return jsonify({'error': 'Invalid input data range'}), 400
        
        # Make prediction
        prediction = predictor.predict(input_data)
        
        # Save prediction log
        log_file = OUTPUT_DIR / f"prediction_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(log_file, 'w') as f:
            json.dump(prediction, f, indent=2)
        
        # After prediction, send updated model to central server
        try:
            from connectors.send_model_update import send_model_update
            send_model_update()
        except Exception as e:
            logger.warning(f"Model update logic failed: {e}")
        return jsonify(prediction), 200
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({'error': str(e)}), 500

# Endpoint to trigger download of the aggregated model from the central server
@app.route('/model/download', methods=['POST'])
def download_aggregated_model_endpoint():
    """Trigger download of the aggregated model from the central server and replace the local model."""
    try:
        from connectors.download_aggregated_model import download_aggregated_model
        success = download_aggregated_model()
        if success:
            return jsonify({'message': 'Aggregated model downloaded and replaced successfully.'}), 200
        else:
            return jsonify({'error': 'Failed to download aggregated model.'}), 500
    except Exception as e:
        logger.error(f"Download aggregated model error: {e}")
        return jsonify({'error': str(e)}), 500

# Endpoint to trigger sending the local model update to the central server
@app.route('/model/send_update', methods=['POST'])
def send_model_update_endpoint():
    """Trigger sending the local model update to the central server."""
    try:
        from connectors.send_model_update import send_model_update
        success = send_model_update()
        if success:
            return jsonify({'message': 'Model update sent to central server successfully.'}), 200
        else:
            return jsonify({'error': 'Failed to send model update.'}), 500
    except Exception as e:
        logger.error(f"Send model update error: {e}")
        return jsonify({'error': str(e)}), 500
    
# Endpoint to trigger model training
@app.route('/model/train', methods=['POST'])
def train_model_endpoint():
    """Trigger model training by running train_model.py as a subprocess."""
    import subprocess, sys
    try:
        result = subprocess.run([sys.executable, 'train_model.py'], capture_output=True, text=True)
        if result.returncode == 0:
            return jsonify({"message": "Model trained successfully.", "stdout": result.stdout}), 200
        else:
            return jsonify({"error": "Training failed.", "stdout": result.stdout, "stderr": result.stderr}), 500
    except Exception as e:
        logger.error(f"Model training error: {e}")
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found. Use /docs for documentation'}), 404


@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    # Initialize model
    if init_model():
        logger.info("🚀 Starting Waste Composition Prediction API")
        logger.info("📚 Documentation available at /docs")
        app.run(host='0.0.0.0', port=5002, debug=False)
    else:
        logger.error("Failed to initialize model. Server cannot start.")

