
"""
Reusable function to send updated waste prediction model to central server
"""
import requests
import os
from dotenv import load_dotenv

def send_model_update(model_path='models/waste_predictor.joblib', server_url='http://127.0.0.1:8000/upload_model'):
    """Send the local model to the central server with twin_identifier from .env"""
    load_dotenv()
    twin_identifier = os.getenv('TWIN_IDENTIFIER', 'unknown_client')
    if not os.path.exists(model_path):
        print(f"Model file not found: {model_path}")
        return False
    try:
        with open(model_path, 'rb') as f:
            files = {'model': (os.path.basename(model_path), f, 'application/octet-stream')}
            data = {'twin_identifier': twin_identifier}
            response = requests.post(server_url, files=files, data=data, timeout=5)
        print('Status:', response.status_code)
        try:
            print('Response:', response.json())
        except Exception:
            print('Raw response:', response.text)
        return response.status_code == 200
    except Exception as e:
        print(f"Error sending model update: {e}")
        return False

if __name__ == "__main__":
    send_model_update()
