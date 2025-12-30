#!/usr/bin/env python3
"""
Generate Excel file with all predicted data points for a given time period
"""

import argparse
from pathlib import Path
from datetime import datetime
from dateutil.relativedelta import relativedelta
import pandas as pd
from utils.digital_twin import SaltProductionDigitalTwin
from utils.synthetic_data_generator import SyntheticDataGenerator
from utils.composition_advanced_predictor import WasteCompositionAdvancedPredictor


def generate_excel(output_file='predictions.xlsx', start_date=None, end_date=None):
    """
    Generate Excel file with all predictions for a time period
    
    Args:
        output_file: Output Excel filename
        start_date: Start date for forecast (default: current month)
        end_date: End date for forecast (default: 12 months from start)
    """
    # Default to current month + 12 months if not specified
    if start_date is None:
        now = datetime.now()
        start_date = datetime(now.year, now.month, 1)
    if end_date is None:
        end_date = start_date + relativedelta(months=12, day=31)
    
    print("\n" + "="*70)
    print("GENERATING EXCEL WITH PREDICTIONS")
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
    
    # Make predictions
    print("\n[3] Making predictions...")
    all_data = []
    
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
        
        # Build data record
        data_record = {
            'Date': pd.Timestamp(row['date']),
            'Month': int(row['month']),
            'Production Volume': float(row['production']),
            'Temperature (°C)': float(row['temperature']),
            'Humidity (%)': float(row['humidity']),
            'Rain (mm)': float(row['rain']),
            'Wind Speed (km/h)': float(row['wind_speed']),
            'Predicted Waste (bags)': float(result['predicted_waste_bags']),
            'Evaporation Index': float(result['evaporation_index']),
            'Confidence': float(result['confidence'])
        }
        
        # Get hybrid composition and market value (ML for high-confidence, rules for low-confidence)
        composition = comp_predictor.predict_composition(
            temperature=float(row['temperature']),
            humidity=float(row['humidity']),
            rain=float(row['rain']),
            month=int(row['month']),
            production_volume=float(row['production'])
        )
        value_info = comp_predictor.estimate_market_value(composition)
        
        # Add composition columns
        data_record['Organic Matter (%)'] = composition['organic_matter_percent']
        data_record['Gypsum (%)'] = composition['gypsum_percent']
        data_record['Magnesium (%)'] = composition['magnesium_percent']
        data_record['Iron Oxides (%)'] = composition['iron_oxides_percent']
        data_record['Silica/Clay (%)'] = composition['silica_clay_percent']
        data_record['Residual Salt (%)'] = composition['residual_salt_percent']
        data_record['Moisture (%)'] = composition['moisture_percent']
        data_record['Value per Bag (USD)'] = value_info['value_per_bag']
        all_data.append(data_record)
    
    # Create DataFrame
    df = pd.DataFrame(all_data)
    
    # Write to Excel with formatting
    print("\n[4] Writing to Excel...")
    with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Predictions', index=False)
        
        # Get worksheet for formatting
        worksheet = writer.sheets['Predictions']
        
        # Auto-adjust column widths
        for column in worksheet.columns:
            max_length = 0
            column_letter = column[0].column_letter
            for cell in column:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except:
                    pass
            adjusted_width = min(max_length + 2, 50)
            worksheet.column_dimensions[column_letter].width = adjusted_width
    
    print(f"✓ Excel file created: {output_file}")
    
    # Summary statistics
    print("\n[5] Summary Statistics")
    print("-" * 70)
    num_months = len(all_data)
    period_label = f"{num_months}-month period" if num_months > 1 else "month"
    
    waste_values = df['Predicted Waste (bags)'].tolist()
    print(f"  Period: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
    print(f"  Total predictions: {num_months} months")
    print(f"  Average waste: {sum(waste_values)/len(waste_values):.0f} bags")
    print(f"  Min waste: {min(waste_values):.0f} bags")
    print(f"  Max waste: {max(waste_values):.0f} bags")
    print(f"  Total waste ({period_label}): {sum(waste_values):.0f} bags")
    print(f"  Output file: {Path(output_file).resolve()}")
    
    print("\n" + "="*70)
    print("✓ EXCEL GENERATION COMPLETE")
    print("="*70 + "\n")
    
    return df


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Generate Excel file with predicted data points',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  python generate_excel.py                                                # Default: current month + 12 months
  python generate_excel.py --output forecast_2025.xlsx                    # Custom output filename
  python generate_excel.py --start 2025-01-01 --end 2025-12-31            # Custom date range
  python generate_excel.py --months 6 --output quarterly_forecast.xlsx    # 6 months forecast
        '''
    )
    parser.add_argument('--start', type=str, default=None,
                       help='Start date (YYYY-MM-DD). Default: current month start')
    parser.add_argument('--end', type=str, default=None,
                       help='End date (YYYY-MM-DD). Default: 12 months from start')
    parser.add_argument('--months', type=int, default=12,
                       help='Number of months to forecast (default: 12). Ignored if --end is specified')
    parser.add_argument('--output', type=str, default='predictions.xlsx',
                       help='Output Excel filename (default: predictions.xlsx)')
    
    args = parser.parse_args()
    
    # Determine date range
    if args.start:
        start_date = pd.to_datetime(args.start)
    else:
        # Start from current month (first day)
        now = datetime.now()
        start_date = datetime(now.year, now.month, 1)
    
    if args.end:
        end_date = pd.to_datetime(args.end)
    else:
        # End date: args.months months from start
        end_date = start_date + relativedelta(months=args.months, day=31)
    
    generate_excel(
        output_file=args.output,
        start_date=start_date,
        end_date=end_date
    )
