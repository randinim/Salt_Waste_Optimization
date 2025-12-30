#!/usr/bin/env python3
"""
Simple data streaming - generates synthetic data and writes predictions to JSON files
Supports batch write (default) and fast mode with configurable delays
"""

import json
import time
import argparse
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import pandas as pd
import requests
from utils.digital_twin import SaltProductionDigitalTwin
from utils.synthetic_data_generator import SyntheticDataGenerator
from utils.composition_advanced_predictor import WasteCompositionAdvancedPredictor
def stream_to_postman(endpoint='http://127.0.0.1:5000/predict', start_date=None, end_date=None, delay=5.0):
    """
    Generate synthetic data and stream to a POST endpoint (e.g., Postman/mock server)
    Args:
        endpoint: URL to POST each prediction
        start_date: Start date for forecast (default: current month)
        end_date: End date for forecast (default: 12 months from start)
        delay: Delay in seconds between data points
    """
    if start_date is None:
        now = datetime.now()
        start_date = datetime(now.year, now.month, 1)
    if end_date is None:
        end_date = start_date + relativedelta(months=12, day=31)

    print("\n" + "="*70)
    print(f"DIGITAL TWIN DATA STREAMING TO POST ENDPOINT (delay={delay}s)")
    print("="*70)

    print("\n[1] Initializing...")
    gen = SyntheticDataGenerator()
    dt = SaltProductionDigitalTwin()
    comp_predictor = WasteCompositionAdvancedPredictor()
    print("✓ Components ready")

    print("\n[2] Generating forecast...")
    synthetic_data = gen.generate_monthly_data(start_date, end_date)
    print(f"✓ Generated {len(synthetic_data)} records")

    print("\n[3] Streaming predictions to POST endpoint...")
    all_predictions = []

    for idx, row in synthetic_data.iterrows():
        result = dt.predict_waste(
            production=float(row['production']),
            temperature=float(row['temperature']),
            humidity=float(row['humidity']),
            rain=float(row['rain']),
            wind_speed=float(row['wind_speed']),
            month=int(row['month'])
        )

        # Build POST body (matching Postman example)
        post_body = {
            "temperature_c": float(row['temperature']),
            "humidity_pct": float(row['humidity']),
            "rain_mm": float(row['rain']),
            "wind_speed_kmh": float(row['wind_speed']),
            "production_volume": float(row['production']),
            "evaporation_index": float(result['evaporation_index']),
            "predicted_waste_bags": float(result['predicted_waste_bags']),
            "confidence": float(result['confidence'])
        }

        # Send POST request
        try:
            resp = requests.post(endpoint, json=post_body, timeout=10)
            status = resp.status_code
            resp_text = resp.text[:100] + ('...' if len(resp.text) > 100 else '')
        except Exception as e:
            status = 'ERR'
            resp_text = str(e)

        date_str = str(row['date']).split()[0]
        print(f"  → {date_str}: POST {status} | waste={post_body['predicted_waste_bags']:.0f} bags | resp: {resp_text}")

        all_predictions.append(post_body)

        # Delay between requests
        if idx < len(synthetic_data) - 1:
            time.sleep(delay)

    print("\n[4] Streaming complete.")
    print("="*70 + "\n")
    return all_predictions


def stream_to_json(output_dir='data/processed/stream_output', start_date=None, end_date=None, fast_mode=False, delay=0):
    """
    Generate synthetic data and stream to JSON files
    
    Args:
        output_dir: Directory to save JSON files
        start_date: Start date for forecast (default: current month)
        end_date: End date for forecast (default: 12 months from start)
        fast_mode: If True, write data points with delay between them
        delay: Delay in seconds between data points (only used in fast mode)
    """
    # Default to current month + 12 months if not specified
    if start_date is None:
        now = datetime.now()
        start_date = datetime(now.year, now.month, 1)
    if end_date is None:
        end_date = start_date + relativedelta(months=12, day=31)
    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    mode_str = f"FAST MODE (delay={delay}s)" if fast_mode else "BATCH MODE (all at once)"
    
    print("\n" + "="*70)
    print(f"DIGITAL TWIN DATA STREAMING TO JSON - {mode_str}")
    print("="*70)
    
    # Initialize components
    print("\n[1] Initializing...")
    gen = SyntheticDataGenerator()
    dt = SaltProductionDigitalTwin()
    comp_predictor = WasteCompositionAdvancedPredictor()
    print("✓ Components ready")
    
    # Generate synthetic data
    print("\n[2] Generating forecast...")
    synthetic_data = gen.generate_monthly_data(start_date, end_date)
    print(f"✓ Generated {len(synthetic_data)} records")
    
    # Make predictions and stream to JSON
    print("\n[3] Streaming predictions to JSON...")
    all_predictions = []
    
    for idx, row in synthetic_data.iterrows():
        # Get prediction
        result = dt.predict_waste(
            production=float(row['production']),
            temperature=float(row['temperature']),
            humidity=float(row['humidity']),
            rain=float(row['rain']),
            wind_speed=float(row['wind_speed']),
            month=int(row['month'])
        )
        
        # Build prediction record
        prediction = {
            'timestamp': datetime.now().isoformat(),
            'date': str(row['date']),
            'month': int(row['month']),
            'input': {
                'production_volume': float(row['production']),
                'temperature_celsius': float(row['temperature']),
                'humidity_percent': float(row['humidity']),
                'rain_mm': float(row['rain']),
                'wind_speed_kmh': float(row['wind_speed'])
            },
            'prediction': {
                'waste_bags': float(result['predicted_waste_bags']),
                'evaporation_index': float(result['evaporation_index']),
                'confidence': float(result['confidence'])
            }
        }
        
        # Get ML-based composition
        composition = comp_predictor.predict_composition(
            temperature=float(row['temperature']),
            humidity=float(row['humidity']),
            rain=float(row['rain']),
            month=int(row['month']),
            production_volume=float(row['production'])
        )
        prediction['composition'] = composition
        
        all_predictions.append(prediction)
        
        # Write individual JSON file per month
        filename = f"prediction_{row['date'].strftime('%Y%m%d')}.json"
        with open(output_path / filename, 'w') as f:
            json.dump(prediction, f, indent=2)
        
        date_str = str(row['date']).split()[0]
        waste = result['predicted_waste_bags']
        print(f"  ✓ {date_str}: {waste:.0f} bags", end='')
        
        # Apply delay in fast mode
        if fast_mode and delay > 0 and idx < len(synthetic_data) - 1:
            print(f" (waiting {delay}s...)")
            time.sleep(delay)
        else:
            print()
    
    # Summary statistics
    print("\n[4] Summary Statistics")
    print("-" * 70)
    waste_values = [p['prediction']['waste_bags'] for p in all_predictions]
    
    # Period label based on actual number of predictions
    num_months = len(all_predictions)
    period_label = f"{num_months}-month period" if num_months > 1 else "month"
    
    print(f"  Period: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
    print(f"  Total predictions: {len(all_predictions)} months")
    print(f"  Average waste: {sum(waste_values)/len(waste_values):.0f} bags")
    print(f"  Min waste: {min(waste_values):.0f} bags")
    print(f"  Max waste: {max(waste_values):.0f} bags")
    print(f"  Total waste ({period_label}): {sum(waste_values):.0f} bags")
    print(f"  Output directory: {output_path.resolve()}")
    
    print("\n" + "="*70)
    print("✓ STREAMING COMPLETE")
    print("="*70 + "\n")
    
    return all_predictions


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Stream digital twin predictions to POST endpoint',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  python stream_data.py                                    # Default: current month + 12 months (13 data points)
  python stream_data.py --months 6                         # Current month + 6 months (7 data points)
  python stream_data.py --start 2025-01-01 --end 2025-12-31  # Custom range
  python stream_data.py --delay 5                          # 5s delay between POSTs
  python stream_data.py --endpoint http://127.0.0.1:5000/predict  # Custom endpoint
        '''
    )
    parser.add_argument('--start', type=str, default=None,
                       help='Start date (YYYY-MM-DD). Default: current month start')
    parser.add_argument('--end', type=str, default=None,
                       help='End date (YYYY-MM-DD). Default: 12 months from start')
    parser.add_argument('--months', type=int, default=12,
                       help='Number of months to forecast (default: 12). Ignored if --end is specified')
    parser.add_argument('--delay', type=float, default=5.0,
                       help='Delay in seconds between POSTs (default: 5)')
    parser.add_argument('--endpoint', type=str, default='http://127.0.0.1:5000/predict',
                       help='POST endpoint URL')

    args = parser.parse_args()

    # Determine date range
    if args.start:
        start_date = pd.to_datetime(args.start)
    else:
        now = datetime.now()
        start_date = datetime(now.year, now.month, 1)

    if args.end:
        end_date = pd.to_datetime(args.end)
    else:
        end_date = start_date + relativedelta(months=args.months, day=31)

    stream_to_postman(
        endpoint=args.endpoint,
        start_date=start_date,
        end_date=end_date,
        delay=args.delay
    )
