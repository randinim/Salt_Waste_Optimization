"""
Quick test to verify S3 update API imports correctly
"""

print("Testing imports...")

try:
    from waste_predictor import update_model_from_s3, restore_model_from_backup
    print("✓ S3 update functions imported successfully")
    
    # Check if functions are callable
    assert callable(update_model_from_s3), "update_model_from_s3 is not callable"
    assert callable(restore_model_from_backup), "restore_model_from_backup is not callable"
    print("✓ Functions are callable")
    
    # Check docstrings
    assert update_model_from_s3.__doc__ is not None, "update_model_from_s3 missing docstring"
    assert restore_model_from_backup.__doc__ is not None, "restore_model_from_backup missing docstring"
    print("✓ Functions have docstrings")
    
    # Print version
    from waste_predictor import __version__
    print(f"✓ Package version: {__version__}")
    
    # List all exported functions
    from waste_predictor import __all__
    print(f"\n✓ Exported functions: {', '.join(__all__)}")
    
    print("\n" + "="*60)
    print("ALL TESTS PASSED!")
    print("="*60)
    
except ImportError as e:
    print(f"✗ Import failed: {e}")
    import traceback
    traceback.print_exc()
    
except AssertionError as e:
    print(f"✗ Assertion failed: {e}")
    import traceback
    traceback.print_exc()
    
except Exception as e:
    print(f"✗ Unexpected error: {e}")
    import traceback
    traceback.print_exc()
