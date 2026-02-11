"""FastAPI model serving."""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import torch
import mlflow.pytorch
import numpy as np
from PIL import Image
import io
import base64
from typing import List, Optional
import logging
import os
from contextlib import asynccontextmanager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global model
model = None
device = "cuda" if torch.cuda.is_available() else "cpu"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup."""
    global model
    model_uri = os.getenv("MODEL_URI", "models:/default_model/Production")

    try:
        model = mlflow.pytorch.load_model(model_uri)
        model = model.to(device)
        model.eval()
        logger.info(f"Model loaded from {model_uri}")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        model = None

    yield

    # Cleanup
    model = None


app = FastAPI(
    title="ML Model API",
    description="REST API for ML model inference",
    version="1.0.0",
    lifespan=lifespan
)


class PredictionInput(BaseModel):
    """Input for prediction."""
    features: List[List[float]] = Field(
        ...,
        description="Feature vectors for prediction"
    )


class ImageInput(BaseModel):
    """Input for image prediction."""
    image_base64: str = Field(
        ...,
        description="Base64 encoded image"
    )


class PredictionOutput(BaseModel):
    """Output from prediction."""
    predictions: List[int]
    probabilities: List[List[float]]
    model_version: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    model_loaded: bool
    device: str


class ModelInfo(BaseModel):
    """Model information."""
    model_type: str
    device: str
    model_uri: Optional[str] = None


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        model_loaded=model is not None,
        device=device
    )


@app.get("/model/info", response_model=ModelInfo)
async def model_info():
    """Get model information."""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    return ModelInfo(
        model_type=type(model).__name__,
        device=device,
        model_uri=os.getenv("MODEL_URI")
    )


@app.post("/predict", response_model=PredictionOutput)
async def predict(input_data: PredictionInput):
    """Make predictions from feature vectors."""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        features = torch.tensor(input_data.features, dtype=torch.float32).to(device)

        with torch.no_grad():
            outputs = model(features)
            probabilities = torch.softmax(outputs, dim=1)
            predictions = torch.argmax(probabilities, dim=1)

        return PredictionOutput(
            predictions=predictions.cpu().tolist(),
            probabilities=probabilities.cpu().tolist()
        )
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/image", response_model=PredictionOutput)
async def predict_image(input_data: ImageInput):
    """Make prediction from base64 encoded image."""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        # Decode image
        image_bytes = base64.b64decode(input_data.image_base64)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Preprocess
        from torchvision import transforms
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

        input_tensor = transform(image).unsqueeze(0).to(device)

        with torch.no_grad():
            outputs = model(input_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            predictions = torch.argmax(probabilities, dim=1)

        return PredictionOutput(
            predictions=predictions.cpu().tolist(),
            probabilities=probabilities.cpu().tolist()
        )
    except Exception as e:
        logger.error(f"Image prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/batch", response_model=PredictionOutput)
async def predict_batch(input_data: PredictionInput):
    """Batch prediction endpoint."""
    return await predict(input_data)
