
"""
Reusable function to trigger model aggregation on the central server
"""
import requests

def aggregate_models(server_url='http://127.0.0.1:8000/aggregate_models'):
    """Trigger model aggregation on the central server."""
    response = requests.post(server_url)
    print('Status:', response.status_code)
    try:
        print('Response:', response.json())
        return response.status_code == 200
    except Exception:
        print('Raw response:', response.text)
        return False

if __name__ == "__main__":
    aggregate_models()
