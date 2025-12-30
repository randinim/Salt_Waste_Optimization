"""
Federated Learning Central Server for Waste Prediction Models
===========================================================

This server receives updated models from clients, aggregates them, and redistributes the optimized main model.
"""

from flask import Flask, request, jsonify, send_file
import os
import joblib
import numpy as np
from werkzeug.utils import secure_filename

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploaded_models')
AGGREGATED_MODEL_PATH = os.path.join(BASE_DIR, 'aggregated_model.joblib')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Store received model paths
received_models = []

@app.route('/upload_model', methods=['POST'])
def upload_model():
    if 'model' not in request.files:
        return jsonify({'error': 'No model file provided'}), 400
    file = request.files['model']
    twin_identifier = request.form.get('twin_identifier', 'unknown_client')
    filename = secure_filename(file.filename)
    # Add twin_identifier as suffix before file extension
    name, ext = os.path.splitext(filename)
    filename_with_id = f"{name}_{twin_identifier}{ext}"
    save_path = os.path.join(UPLOAD_FOLDER, filename_with_id)
    file.save(save_path)
    received_models.append(save_path)
    return jsonify({'message': f'Model {filename_with_id} uploaded successfully.'}), 200

@app.route('/aggregate_models', methods=['POST'])
def aggregate_models():
    if not received_models:
        return jsonify({'error': 'No models to aggregate.'}), 400
    # Load all models (assume sklearn SGDRegressor or MultiOutputRegressor)
    models = [joblib.load(path) for path in received_models]
    # Aggregate by averaging coefficients (simple federated averaging)
    # Assumes all models have same structure
    base_model = models[0]
    if hasattr(base_model, 'estimators_'):
        # MultiOutputRegressor
        for i, est in enumerate(base_model.estimators_):
            coefs = np.array([m.estimators_[i].coef_ for m in models])
            intercepts = np.array([m.estimators_[i].intercept_ for m in models])
            est.coef_ = np.mean(coefs, axis=0)
            est.intercept_ = np.mean(intercepts, axis=0)
    else:
        # Single estimator
        coefs = np.array([m.coef_ for m in models])
        intercepts = np.array([m.intercept_ for m in models])
        base_model.coef_ = np.mean(coefs, axis=0)
        base_model.intercept_ = np.mean(intercepts, axis=0)
    joblib.dump(base_model, AGGREGATED_MODEL_PATH)
    return jsonify({'message': 'Models aggregated.', 'aggregated_model': AGGREGATED_MODEL_PATH}), 200

@app.route('/download_model', methods=['GET'])
def download_model():
    if not os.path.exists(AGGREGATED_MODEL_PATH):
        return jsonify({'error': 'No aggregated model available. ' + AGGREGATED_MODEL_PATH}), 404
    return send_file(AGGREGATED_MODEL_PATH, as_attachment=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
