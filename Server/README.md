# NumPy Server

A simple Flask server that provides NumPy operations as a service.

## Setup

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- **GET** `/health`
- Returns server health status

### NumPy Array Processing
- **POST** `/numpy/array`
- Accepts JSON with an array of numbers
- Returns various NumPy operations on the array

Example request:
```bash
curl -X POST http://localhost:5000/numpy/array \
-H "Content-Type: application/json" \
-d '{"array": [1, 2, 3, 4, 5]}'
```

Example response:
```json
{
    "mean": 3.0,
    "sum": 15.0,
    "shape": [5],
    "max": 5.0,
    "min": 1.0
}
``` 