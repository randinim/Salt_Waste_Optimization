# Federated Client API

This document shows the local FastAPI endpoints provided by the federated client and example `curl` commands you can use to interact with it. The client runs a FastAPI server on port `8001` by default.

Base URL: http://localhost:8001

Endpoints
---------

- `POST /predict` — Run inference for a single input and persist the prediction.
  - Body: `{ "features": [production_volume, rain_sum, temperature_mean, humidity_mean, wind_speed_mean] }`

- `POST /train-data` — Submit a labeled training example to the client's buffer (used for local FL training).
  - Body: `{ "features": [...5 numbers...], "targets": [...8 numbers...] }`

- `GET /status` — Return client buffer size and whether the FL client thread is running.

- `POST /sync-model` — Trigger the client to download the latest published model artifact from the server (if configured).

 - `GET /predictions` — Cursor-based listing (infinite-scroll style). Returns newest-first.
  - Query params: `next_data_id` (integer, 0 = newest), `page_size` (integer)
  - Response: `{ total_count, next_data_id, has_more, predictions: [...] }` (the server does not return `page_size`)

Examples (curl)
---------------

# 1) Predict
curl -X POST http://localhost:8001/predict \
  -H "Content-Type: application/json" \
  -d "{ \"features\": [1200.0, 5.2, 22.1, 55.0, 3.4] }"

# 2) Submit training data (5 features, 8 targets)
curl -X POST http://localhost:8001/train-data \
  -H "Content-Type: application/json" \
  -d '{ "features": [1200.0, 5.2, 22.1, 55.0, 3.4], "targets": [100.0, 10.0, 5.0, 2.0, 50.0, 1.0, 0.5, 0.2] }'

# 3) Check status
curl http://localhost:8001/status

# 4) Force model sync (if SERVER_MODEL_URL is configured on the client)
curl -X POST http://localhost:8001/sync-model

# 5) Fetch predictions (infinite-scroll / cursor)
#    - To get the newest `page_size=20` items: `next_data_id=0`
curl "http://localhost:8001/predictions?next_data_id=0&page_size=20"

#    - If the response contains `next_data_id` = 20, call again with that value to get the next page:
curl "http://localhost:8001/predictions?next_data_id=20&page_size=20"

Notes
-----
- The client appends predictions to `predictions.jsonl` inside the client folder. The `GET /predictions` endpoint returns newest-first ordering and uses `next_data_id` as a zero-based cursor into that ordering. When `next_data_id` is `null` in the response, there are no more items.
- Ports: The FastAPI app listens on port `8001` by default. Adjust the port in `client.py` if needed.

Generating `monthly_features.parquet`
-------------------------------

If you need `monthly_features.parquet` (monthly-aggregated features for the predictor), a helper script is included: `generate_monthly_features.py`.

Example:
```
python generate_monthly_features.py -i ../digital_twin_module-v2/data/final/training_data_5years.csv \
  -o monthly_features.parquet --date-col date
```

The script auto-detects common date column names (`date`, `timestamp`, `datetime`) if you don't pass `--date-col`. It writes the parquet file to the path you supply with `-o` (defaults to `monthly_features.parquet`).

Troubleshooting
---------------
- If `predict` fails with a model-load error, ensure the client has a compatible `WastePredictor` implementation and that `MODEL_PATH` or `SERVER_MODEL_URL` (for remote fetch) is configured.
- For FL operation make sure `SERVER_ADDRESS` env var is set before starting the client thread.

