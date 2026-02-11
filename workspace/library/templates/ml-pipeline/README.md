# {{APP_NAME}} - ML Pipeline

A production-ready Machine Learning pipeline with PyTorch/TensorFlow, MLflow tracking, and deployment support.

## Features

- **Training Pipeline** - End-to-end training with experiment tracking
- **MLflow Integration** - Automatic logging of metrics, params, and artifacts
- **Model Registry** - Version and stage management
- **FastAPI Serving** - REST API for model inference
- **Docker Support** - Containerized training and serving
- **CI/CD Ready** - GitHub Actions workflow included

## Tech Stack

- **Framework**: PyTorch 2.x / TensorFlow 2.x
- **Tracking**: MLflow
- **Serving**: FastAPI, TorchServe/TF Serving
- **Data**: Pandas, NumPy, scikit-learn
- **Validation**: Great Expectations
- **Testing**: pytest

## Quick Start

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Set up environment

```bash
cp .env.example .env
```

### 3. Start MLflow server

```bash
mlflow server --host 0.0.0.0 --port 5000
```

### 4. Train a model

```bash
python src/models/train.py --config configs/training.yaml
```

### 5. Start serving API

```bash
uvicorn src.serving.api:app --host 0.0.0.0 --port 8000
```

## Project Structure

```
{{APP_NAME}}/
├── configs/
│   ├── training.yaml       # Training configuration
│   └── serving.yaml        # Serving configuration
├── src/
│   ├── data/
│   │   ├── load.py         # Data loading utilities
│   │   └── preprocess.py   # Preprocessing pipeline
│   ├── features/
│   │   └── engineering.py  # Feature engineering
│   ├── models/
│   │   ├── train.py        # Training script
│   │   ├── evaluate.py     # Evaluation script
│   │   └── architectures/  # Model definitions
│   └── serving/
│       └── api.py          # FastAPI inference API
├── tests/
├── notebooks/
├── docker/
│   ├── Dockerfile.train
│   └── Dockerfile.serve
├── MLproject              # MLflow project definition
├── requirements.txt
└── pyproject.toml
```

## Training

```bash
# Basic training
python src/models/train.py

# With custom config
python src/models/train.py --config configs/custom.yaml

# With MLflow run
mlflow run . -P epochs=50 -P lr=0.001
```

## Model Registry

```python
import mlflow

# Promote model to production
client = mlflow.tracking.MlflowClient()
client.transition_model_version_stage(
    name="{{APP_NAME}}_model",
    version=1,
    stage="Production"
)
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/predict` | POST | Single prediction |
| `/predict/batch` | POST | Batch predictions |
| `/model/info` | GET | Model information |

## Docker

```bash
# Build training image
docker build -f docker/Dockerfile.train -t {{APP_NAME}}-train .

# Build serving image
docker build -f docker/Dockerfile.serve -t {{APP_NAME}}-serve .

# Run with docker-compose
docker-compose up
```

## Testing

```bash
pytest tests/ -v --cov=src
```

## License

MIT
