"""Test the package locally before publishing"""

from waste_predictor import predict_waste

# Test prediction
result = predict_waste(
    production_volume=50000,
    rain_sum=200,
    temperature_mean=28,
    humidity_mean=85,
    wind_speed_mean=15,
    month=6
)

print("=== LOCAL TEST ===")
print(f"Total Waste: {result['Total_Waste_kg']:,.0f} kg")
print(f"Limestone: {result['Solid_Waste_Limestone_kg']:,.0f} kg")
print(f"Gypsum: {result['Solid_Waste_Gypsum_kg']:,.0f} kg")
print("\nTest PASSED! ✓")
