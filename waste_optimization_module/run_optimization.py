"""
Waste Optimization - Command Line Interface
============================================

Run waste optimization scenarios from command line.

Examples:
    # Minimize total waste for July
    python run_optimization.py --mode minimize --month 7
    
    # Target 4% total waste for July
    python run_optimization.py --mode target --month 7 --target-total 4.0
    
    # Target specific waste breakdown
    python run_optimization.py --mode target --month 7 --target-total 4.5 --target-salt-dust 1.5

Author: AI/ML Tech Lead
Date: December 2025
"""

import argparse
import sys
from pathlib import Path

from optimizer import WasteOptimizer, print_optimization_result
from constraints import FeatureConstraints


def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(
        description='Optimize production features for desired waste outcomes',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Minimize waste for July production
  python run_optimization.py --mode minimize --month 7
  
  # Target 4% total waste
  python run_optimization.py --mode target --month 7 --target-total 4.0
  
  # Target specific breakdown
  python run_optimization.py --mode target --month 7 --target-total 4.5 --target-salt-dust 1.5 --target-brine 1.0
  
  # Fix production level
  python run_optimization.py --mode minimize --month 7 --production 3000000
        """
    )
    
    parser.add_argument(
        '--mode',
        type=str,
        required=True,
        choices=['minimize', 'target'],
        help='Optimization mode: minimize total waste or target specific percentages'
    )
    
    parser.add_argument(
        '--month',
        type=int,
        required=True,
        choices=range(1, 13),
        help='Target month (1-12)'
    )
    
    parser.add_argument(
        '--production',
        type=float,
        default=None,
        help='Fixed production level in kg (default: optimize this too)'
    )
    
    parser.add_argument(
        '--target-total',
        type=float,
        default=None,
        help='Target total waste percentage (for target mode)'
    )
    
    parser.add_argument(
        '--target-salt-dust',
        type=float,
        default=None,
        help='Target salt dust percentage'
    )
    
    parser.add_argument(
        '--target-brine',
        type=float,
        default=None,
        help='Target brine runoff percentage'
    )
    
    parser.add_argument(
        '--target-organic',
        type=float,
        default=None,
        help='Target organic matter percentage'
    )
    
    parser.add_argument(
        '--target-packaging',
        type=float,
        default=None,
        help='Target packaging waste percentage'
    )
    
    parser.add_argument(
        '--target-other',
        type=float,
        default=None,
        help='Target other solids percentage'
    )
    
    parser.add_argument(
        '--method',
        type=str,
        default='SLSQP',
        choices=['SLSQP', 'trust-constr', 'differential_evolution'],
        help='Optimization algorithm (default: SLSQP)'
    )
    
    parser.add_argument(
        '--no-seasonal',
        action='store_true',
        help='Disable seasonal constraints (use global bounds)'
    )
    
    parser.add_argument(
        '--output',
        type=str,
        default=None,
        help='Output filename for results (auto-generated if not specified)'
    )
    
    return parser.parse_args()


def main():
    """Main execution"""
    args = parse_args()
    
    # Initialize optimizer
    print("\nInitializing Waste Optimization Engine...")
    optimizer = WasteOptimizer()
    
    # Run optimization based on mode
    if args.mode == 'minimize':
        result = optimizer.optimize_minimize_waste(
            month=args.month,
            production_kg=args.production,
            method=args.method,
            use_seasonal_constraints=not args.no_seasonal
        )
    
    elif args.mode == 'target':
        # Build target dictionary
        targets = {}
        if args.target_total is not None:
            targets['total_waste_kg'] = args.target_total
        if args.target_salt_dust is not None:
            targets['salt_dust_kg'] = args.target_salt_dust
        if args.target_brine is not None:
            targets['brine_runoff_kg'] = args.target_brine
        if args.target_organic is not None:
            targets['organic_matter_kg'] = args.target_organic
        if args.target_packaging is not None:
            targets['packaging_waste_kg'] = args.target_packaging
        if args.target_other is not None:
            targets['other_solids_kg'] = args.target_other
        
        if not targets:
            print("\nERROR: Target mode requires at least one target percentage")
            print("Use --target-total, --target-salt-dust, etc.")
            sys.exit(1)
        
        result = optimizer.optimize_target_waste(
            target_percentages=targets,
            month=args.month,
            production_kg=args.production,
            method=args.method,
            use_seasonal_constraints=not args.no_seasonal
        )
    
    # Print results
    print_optimization_result(result)
    
    # Save to file
    if args.output:
        filename = args.output
    else:
        mode_str = 'minimize' if args.mode == 'minimize' else 'target'
        filename = f"optimization_{mode_str}_month{args.month:02d}.json"
    
    optimizer.save_result(result, filename)
    
    # Validation
    is_valid, msg = FeatureConstraints.validate_features(result.optimal_features)
    if not is_valid:
        print(f"\n⚠️  WARNING: Optimal features may be unrealistic: {msg}")
    else:
        print(f"\n✓ Optimal features validated successfully")
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
