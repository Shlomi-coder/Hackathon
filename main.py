from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import uvicorn

# Initialize FastAPI app
app = FastAPI()

# Define request model
class PredictionRequest(BaseModel):
    frames: List[str]

@app.post("/predict")
async def predict(request: PredictionRequest):
    try:
        # Log the number of frames received (for debugging)
        print(f"Received {len(request.frames)} frames")
        
        # Return dummy result
        return {
            "label": "real",
            "confidence": 100
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 