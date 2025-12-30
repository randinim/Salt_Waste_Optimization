
"""
Reusable function to download the aggregated model from the central server and replace the local model.
"""
import requests
import os

def download_aggregated_model(server_url='http://127.0.0.1:8000/download_model', local_model_dir='models', local_model_name='waste_predictor.joblib'):
    """Download the aggregated model from the central server and save it locally."""
    local_model_path = os.path.join(local_model_dir, local_model_name)
    response = requests.get(server_url)
    if response.status_code == 200:
        os.makedirs(local_model_dir, exist_ok=True)
        with open(local_model_path, 'wb') as f:
            f.write(response.content)
        print(f'Aggregated model downloaded and saved to {local_model_path}')
        return True
    else:
        print(f'Failed to download model. Status: {response.status_code}')
        print('Response:', response.text)
        return False

if __name__ == "__main__":
    download_aggregated_model()
