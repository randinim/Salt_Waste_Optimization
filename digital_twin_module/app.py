"""
Flask API for Salt Production Digital Twin
Provides endpoints for predictions, what-if scenarios, and sensitivity analysis.
"""

from flask import Flask, request, jsonify
from utils.digital_twin import SaltProductionDigitalTwin
import traceback
import os
import subprocess
import signal

app = Flask(__name__)

def get_twin():
    # You may want to adjust model/scaler/feature paths if needed
    return SaltProductionDigitalTwin()

# Path to stream_data.py
STREAM_SCRIPT = os.path.join(os.path.dirname(__file__), "stream_data.py")
# PID file to track the stream process
PID_FILE = os.path.join(os.path.dirname(__file__), "stream_data.pid")

@app.route("/predict", methods=["POST"])
def predict():
    """Predict waste for given input conditions."""
    try:
        data = request.get_json()
        required = ["production", "temperature", "humidity", "rain", "wind_speed", "month"]
        for r in required:
            if r not in data:
                return jsonify({"error": f"Missing required field: {r}"}), 400
        prev_prod = data.get("prev_prod")
        twin = get_twin()
        result = twin.predict_waste(
            production=float(data["production"]),
            temperature=float(data["temperature"]),
            humidity=float(data["humidity"]),
            rain=float(data["rain"]),
            wind_speed=float(data["wind_speed"]),
            month=int(data["month"]),
            prev_prod=float(prev_prod) if prev_prod is not None else None
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

@app.route("/scenario", methods=["POST"])
def scenario():
    """Simulate a what-if scenario."""
    try:
        data = request.get_json()
        scenario_name = data.get("scenario_name", "Custom Scenario")
        changes = data.get("changes", {})
        twin = get_twin()
        result = twin.simulate_scenario(scenario_name, changes)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

@app.route("/sensitivity", methods=["POST"])
def sensitivity():
    """Run sensitivity analysis for a variable."""
    try:
        data = request.get_json()
        variable = data.get("variable")
        range_pct = float(data.get("range_pct", 0.2))
        if not variable:
            return jsonify({"error": "Missing 'variable' field"}), 400
        twin = get_twin()
        result = twin.sensitivity_analysis(variable, range_pct)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

# --- STREAM CONTROL ENDPOINTS ---
@app.route("/start_stream", methods=["POST"])
def start_stream():
    """Start the stream_data.py process as a background process and log output to a file."""
    if os.path.exists(PID_FILE):
        return jsonify({"status": "already_running"}), 400
    try:
        log_file = os.path.join(os.path.dirname(__file__), "stream_data.log")
        log_fh = open(log_file, "a")
        proc = subprocess.Popen(["python", STREAM_SCRIPT], stdout=log_fh, stderr=log_fh)
        with open(PID_FILE, "w") as f:
            f.write(str(proc.pid))
        return jsonify({"status": "started", "pid": proc.pid, "log_file": log_file})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/stop_stream", methods=["POST"])
def stop_stream():
    """Stop the stream_data.py process if running."""
    if not os.path.exists(PID_FILE):
        return jsonify({"status": "not_running"}), 400
    try:
        with open(PID_FILE, "r") as f:
            pid = int(f.read())
        # Terminate the process
        if os.name == 'nt':
            # Windows
            subprocess.call(["taskkill", "/F", "/PID", str(pid)])
        else:
            os.kill(pid, signal.SIGTERM)
        os.remove(PID_FILE)
        return jsonify({"status": "stopped", "pid": pid})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5003))
    app.run(host="0.0.0.0", port=port, debug=False)