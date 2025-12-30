"""
Waste Optimization Server (Microservice)
========================================
Provides optimization endpoints to find optimal production conditions.

Uses the trained waste prediction model to perform inverse optimization.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path
import logging
import json

from optimizer import WasteOptimizer

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Output directory for optimization results
OUTPUT_DIR = Path(__file__).parent / 'results'
OUTPUT_DIR.mkdir(exist_ok=True, parents=True)

# Initialize optimizer
try:
    optimizer = WasteOptimizer()
    logger.info("✅ Waste Optimizer initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize optimizer: {e}")
    optimizer = None


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    if optimizer is None:
        return jsonify({
            'status': 'unhealthy',
            'message': 'Optimizer not loaded'
        }), 503
    
    return jsonify({
        'status': 'healthy',
        'service': 'Waste Optimization Server',
        'optimizer_ready': True
    })


@app.route('/optimize/minimize', methods=['POST'])
def optimize_minimize():
    """
    Find optimal features to minimize total waste.
    
    Request body:
    {
        "month": 7,
        "production_kg": 3500000  (optional)
    }
    
    Response:
    {
        "status": "success",
        "optimization": {
            "method": "SLSQP",
            "iterations": 25,
            "objective_value": 1.94,
            "optimal_features": {...},
            "predicted_waste_pct": {...}
        }
    }
    """
    if optimizer is None:
        return jsonify({'error': 'Optimizer not available'}), 503
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Validate required fields
        if 'month' not in data:
            return jsonify({'error': 'month is required'}), 400
        
        month = int(data['month'])
        if not (1 <= month <= 12):
            return jsonify({'error': 'Month must be between 1 and 12'}), 400
        
        # Optional parameters
        production_kg = data.get('production_kg')
        if production_kg:
            production_kg = float(production_kg)
        
        logger.info(f"Minimize optimization request: month={month}, production={production_kg}")
        
        # Run optimization
        result = optimizer.optimize_minimize_waste(
            month=month,
            production_kg=production_kg
        )
        
        if not result.success:
            return jsonify({
                'error': 'Optimization failed',
                'message': result.message,
                'method': result.method
            }), 500
        
        # Save result
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        result_file = OUTPUT_DIR / f'minimize_{timestamp}.json'
        optimizer.save_result(result, result_file)
        
        # Format response
        response = {
            'status': 'success',
            'optimization': {
                'type': 'minimize',
                'method': result.method,
                'iterations': result.iterations,
                'objective_value': float(result.objective_value),
                'optimal_features': {
                    'temperature_c': float(result.optimal_features['temperature_c']),
                    'humidity_pct': float(result.optimal_features['humidity_pct']),
                    'rainfall_mm': float(result.optimal_features['rainfall_mm']),
                    'wind_speed_kmh': float(result.optimal_features['wind_speed_kmh']),
                    'production_kg': float(result.optimal_features['production_kg']),
                    'month': int(result.optimal_features['month'])
                },
                'predicted_waste_pct': {
                    'total_waste': float(result.predicted_waste.get('total_waste_kg', 0)),
                    'salt_dust': float(result.predicted_waste.get('salt_dust_kg', 0)),
                    'brine_runoff': float(result.predicted_waste.get('brine_runoff_kg', 0)),
                    'organic_matter': float(result.predicted_waste.get('organic_matter_kg', 0)),
                    'packaging_waste': float(result.predicted_waste.get('packaging_waste_kg', 0)),
                    'other_solids': float(result.predicted_waste.get('other_solids_kg', 0))
                }
            },
            'metadata': {
                'timestamp': timestamp,
                'result_file': str(result_file.name)
            }
        }
        
        logger.info(f"Minimize optimization successful: {result.objective_value:.2f}% total waste")
        return jsonify(response)
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Optimization error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/optimize/target', methods=['POST'])
def optimize_target():
    """
    Find optimal features to achieve target waste percentages.
    
    Request body:
    {
        "month": 7,
        "production_kg": 3500000,  (optional)
        "target_total_waste": 4.5,
        "target_salt_dust": 1.5,
        "target_brine": 1.2,
        "target_organic": 0.8
    }
    
    Response:
    {
        "status": "success",
        "optimization": {
            "method": "DE",
            "iterations": 50,
            "objective_value": 24.58,
            "optimal_features": {...},
            "predicted_waste_pct": {...},
            "target_waste_pct": {...},
            "deviation": 24.58
        }
    }
    """
    if optimizer is None:
        return jsonify({'error': 'Optimizer not available'}), 503
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Validate required fields
        if 'month' not in data:
            return jsonify({'error': 'month is required'}), 400
        
        month = int(data['month'])
        if not (1 <= month <= 12):
            return jsonify({'error': 'Month must be between 1 and 12'}), 400
        
        # Build target percentages
        target_percentages = {}
        if 'target_total_waste' in data:
            target_percentages['total_waste_kg'] = float(data['target_total_waste'])
        if 'target_salt_dust' in data:
            target_percentages['salt_dust_kg'] = float(data['target_salt_dust'])
        if 'target_brine' in data:
            target_percentages['brine_runoff_kg'] = float(data['target_brine'])
        if 'target_organic' in data:
            target_percentages['organic_matter_kg'] = float(data['target_organic'])
        if 'target_packaging' in data:
            target_percentages['packaging_waste_kg'] = float(data['target_packaging'])
        if 'target_other' in data:
            target_percentages['other_solids_kg'] = float(data['target_other'])
        
        if not target_percentages:
            return jsonify({'error': 'At least one target must be specified'}), 400
        
        # Optional parameters
        production_kg = data.get('production_kg')
        if production_kg:
            production_kg = float(production_kg)
        
        logger.info(f"Target optimization request: month={month}, targets={list(target_percentages.keys())}")
        
        # Run optimization
        result = optimizer.optimize_target_waste(
            target_percentages=target_percentages,
            month=month,
            production_kg=production_kg
        )
        
        if not result.success:
            return jsonify({
                'error': 'Optimization failed',
                'message': result.message,
                'method': result.method
            }), 500
        
        # Save result
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        result_file = OUTPUT_DIR / f'target_{timestamp}.json'
        optimizer.save_result(result, result_file)
        
        # Format response
        response = {
            'status': 'success',
            'optimization': {
                'type': 'target',
                'method': result.method,
                'iterations': result.iterations,
                'objective_value': float(result.objective_value),
                'optimal_features': {
                    'temperature_c': float(result.optimal_features['temperature_c']),
                    'humidity_pct': float(result.optimal_features['humidity_pct']),
                    'rainfall_mm': float(result.optimal_features['rainfall_mm']),
                    'wind_speed_kmh': float(result.optimal_features['wind_speed_kmh']),
                    'production_kg': float(result.optimal_features['production_kg']),
                    'month': int(result.optimal_features['month'])
                },
                'predicted_waste_pct': {
                    'total_waste': float(result.predicted_waste.get('total_waste_kg', 0)),
                    'salt_dust': float(result.predicted_waste.get('salt_dust_kg', 0)),
                    'brine_runoff': float(result.predicted_waste.get('brine_runoff_kg', 0)),
                    'organic_matter': float(result.predicted_waste.get('organic_matter_kg', 0)),
                    'packaging_waste': float(result.predicted_waste.get('packaging_waste_kg', 0)),
                    'other_solids': float(result.predicted_waste.get('other_solids_kg', 0))
                },
                'target_waste_pct': target_percentages,
                'deviation': float(result.objective_value)
            },
            'metadata': {
                'timestamp': timestamp,
                'result_file': str(result_file.name)
            }
        }
        
        logger.info(f"Target optimization successful: deviation={result.objective_value:.4f}")
        return jsonify(response)
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Target optimization error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/optimize/history', methods=['GET'])
def get_optimization_history():
    """Get list of saved optimization results"""
    try:
        optimizations = []
        
        if OUTPUT_DIR.exists():
            for file in sorted(OUTPUT_DIR.glob('*.json'), reverse=True):
                optimizations.append({
                    'filename': file.name,
                    'timestamp': file.stat().st_mtime,
                    'size_bytes': file.stat().st_size,
                    'type': 'minimize' if 'minimize' in file.name else 'target'
                })
        
        return jsonify({
            'total': len(optimizations),
            'optimizations': optimizations[:50]  # Last 50
        })
        
    except Exception as e:
        logger.error(f"Error getting optimization history: {e}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("\n" + "="*80)
    print("WASTE OPTIMIZATION SERVER (Microservice)")
    print("="*80)
    
    if optimizer:
        print(f"\nOptimizer: Ready")
        print(f"Features: {optimizer.feature_order}")
        print(f"Model R² Score: {optimizer.metrics.get('avg_r2_test', 'N/A')}")
    
    print(f"\nServer starting on: http://localhost:5001")
    print("\nOptimization Endpoints:")
    print("  GET  /health              - Health check")
    print("  POST /optimize/minimize   - Find features to minimize waste")
    print("  POST /optimize/target     - Find features for target waste")
    print("  GET  /optimize/history    - Optimization history")
    print("\n" + "="*80 + "\n")
    
    app.run(debug=False, use_reloader=False, host='0.0.0.0', port=5001)
