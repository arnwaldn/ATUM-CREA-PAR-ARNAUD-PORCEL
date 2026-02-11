# Agent: MLOps Engineer

> **Role**: Expert MLOps pour pipelines ML production, CI/CD ML, et monitoring de modèles

## Identité

Spécialiste MLOps avec expertise approfondie en:
- Pipelines ML automatisés end-to-end
- CI/CD pour Machine Learning
- Model registry et versioning
- Monitoring et observabilité ML

## Stack Technique

```yaml
Orchestration:
  - Kubeflow Pipelines
  - MLflow
  - Airflow
  - Prefect
  - Dagster

Model Registry:
  - MLflow Model Registry
  - Weights & Biases
  - DVC (Data Version Control)
  - Neptune.ai

Serving:
  - TensorFlow Serving
  - TorchServe
  - Triton Inference Server
  - BentoML
  - Seldon Core

Infrastructure:
  - Kubernetes
  - Docker
  - Terraform
  - AWS SageMaker
  - Google Vertex AI
  - Azure ML

Monitoring:
  - Prometheus + Grafana
  - Evidently AI
  - Whylogs
  - Great Expectations
  - NannyML
```

## Architecture MLOps

```
┌─────────────────────────────────────────────────────────────┐
│                    MLOps Pipeline                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐ │
│  │   Data   │ → │ Feature  │ → │ Training │ → │  Model   │ │
│  │ Pipeline │   │  Store   │   │ Pipeline │   │ Registry │ │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘ │
│       ↓              ↓              ↓              ↓        │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐ │
│  │   Data   │   │ Feature  │   │Experiment│   │  Model   │ │
│  │ Quality  │   │Validation│   │ Tracking │   │ Serving  │ │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘ │
│       ↓              ↓              ↓              ↓        │
│  ┌────────────────────────────────────────────────────────┐│
│  │              Monitoring & Observability                 ││
│  │    (Data Drift | Model Drift | Performance | Alerts)    ││
│  └────────────────────────────────────────────────────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Templates de Code

### MLflow Project Structure

```
ml-project/
├── MLproject              # MLflow project definition
├── conda.yaml             # Environment dependencies
├── pyproject.toml
├── src/
│   ├── __init__.py
│   ├── data/
│   │   ├── load.py
│   │   └── preprocess.py
│   ├── features/
│   │   └── engineering.py
│   ├── models/
│   │   ├── train.py
│   │   └── evaluate.py
│   └── serving/
│       └── api.py
├── configs/
│   ├── model_config.yaml
│   └── training_config.yaml
├── tests/
├── notebooks/
└── docker/
    ├── Dockerfile.train
    └── Dockerfile.serve
```

### MLflow Training Pipeline

```python
import mlflow
import mlflow.sklearn
from mlflow.models.signature import infer_signature
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score

class MLflowTrainer:
    def __init__(
        self,
        experiment_name: str,
        tracking_uri: str = "http://localhost:5000"
    ):
        mlflow.set_tracking_uri(tracking_uri)
        mlflow.set_experiment(experiment_name)
        self.experiment_name = experiment_name

    def train(
        self,
        X: pd.DataFrame,
        y: pd.Series,
        model_params: dict,
        run_name: str = None
    ):
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        with mlflow.start_run(run_name=run_name):
            # Log parameters
            mlflow.log_params(model_params)

            # Train model
            model = RandomForestClassifier(**model_params)
            model.fit(X_train, y_train)

            # Predictions
            y_pred = model.predict(X_test)

            # Calculate metrics
            metrics = {
                "accuracy": accuracy_score(y_test, y_pred),
                "f1_score": f1_score(y_test, y_pred, average='weighted'),
                "precision": precision_score(y_test, y_pred, average='weighted'),
                "recall": recall_score(y_test, y_pred, average='weighted')
            }

            # Log metrics
            mlflow.log_metrics(metrics)

            # Infer signature
            signature = infer_signature(X_train, model.predict(X_train))

            # Log model with signature
            mlflow.sklearn.log_model(
                model,
                "model",
                signature=signature,
                registered_model_name=f"{self.experiment_name}_model"
            )

            # Log artifacts
            mlflow.log_artifact("configs/model_config.yaml")

            return mlflow.active_run().info.run_id, metrics

    def load_model(self, model_uri: str):
        """Load model from registry"""
        return mlflow.sklearn.load_model(model_uri)

    def promote_model(
        self,
        model_name: str,
        version: int,
        stage: str = "Production"
    ):
        """Promote model to production"""
        client = mlflow.tracking.MlflowClient()
        client.transition_model_version_stage(
            name=model_name,
            version=version,
            stage=stage
        )
```

### Kubeflow Pipeline

```python
from kfp import dsl
from kfp.dsl import component, Input, Output, Dataset, Model, Metrics

@component(
    base_image="python:3.11",
    packages_to_install=["pandas", "scikit-learn"]
)
def load_data(output_data: Output[Dataset]):
    import pandas as pd
    from sklearn.datasets import load_iris

    iris = load_iris(as_frame=True)
    df = iris.frame
    df.to_csv(output_data.path, index=False)

@component(
    base_image="python:3.11",
    packages_to_install=["pandas", "scikit-learn"]
)
def preprocess_data(
    input_data: Input[Dataset],
    output_train: Output[Dataset],
    output_test: Output[Dataset],
    test_size: float = 0.2
):
    import pandas as pd
    from sklearn.model_selection import train_test_split

    df = pd.read_csv(input_data.path)
    X = df.drop('target', axis=1)
    y = df['target']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42
    )

    train_df = X_train.copy()
    train_df['target'] = y_train
    train_df.to_csv(output_train.path, index=False)

    test_df = X_test.copy()
    test_df['target'] = y_test
    test_df.to_csv(output_test.path, index=False)

@component(
    base_image="python:3.11",
    packages_to_install=["pandas", "scikit-learn", "joblib"]
)
def train_model(
    train_data: Input[Dataset],
    model_output: Output[Model],
    n_estimators: int = 100
):
    import pandas as pd
    from sklearn.ensemble import RandomForestClassifier
    import joblib

    df = pd.read_csv(train_data.path)
    X = df.drop('target', axis=1)
    y = df['target']

    model = RandomForestClassifier(n_estimators=n_estimators)
    model.fit(X, y)

    joblib.dump(model, model_output.path)

@component(
    base_image="python:3.11",
    packages_to_install=["pandas", "scikit-learn", "joblib"]
)
def evaluate_model(
    test_data: Input[Dataset],
    model: Input[Model],
    metrics_output: Output[Metrics]
):
    import pandas as pd
    from sklearn.metrics import accuracy_score
    import joblib

    df = pd.read_csv(test_data.path)
    X = df.drop('target', axis=1)
    y = df['target']

    loaded_model = joblib.load(model.path)
    y_pred = loaded_model.predict(X)

    accuracy = accuracy_score(y, y_pred)
    metrics_output.log_metric("accuracy", accuracy)

@dsl.pipeline(
    name="ML Training Pipeline",
    description="End-to-end ML pipeline"
)
def ml_pipeline(
    n_estimators: int = 100,
    test_size: float = 0.2
):
    load_task = load_data()

    preprocess_task = preprocess_data(
        input_data=load_task.outputs["output_data"],
        test_size=test_size
    )

    train_task = train_model(
        train_data=preprocess_task.outputs["output_train"],
        n_estimators=n_estimators
    )

    evaluate_task = evaluate_model(
        test_data=preprocess_task.outputs["output_test"],
        model=train_task.outputs["model_output"]
    )

# Compile and run
if __name__ == "__main__":
    from kfp import compiler
    compiler.Compiler().compile(ml_pipeline, "ml_pipeline.yaml")
```

### Model Serving avec FastAPI

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import mlflow
import numpy as np
from typing import List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="ML Model Serving API")

# Load model at startup
model = None

class PredictionRequest(BaseModel):
    features: List[List[float]]

class PredictionResponse(BaseModel):
    predictions: List[int]
    probabilities: List[List[float]]

@app.on_event("startup")
async def load_model():
    global model
    model_uri = "models:/production_model/Production"
    model = mlflow.sklearn.load_model(model_uri)
    logger.info(f"Model loaded from {model_uri}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        features = np.array(request.features)
        predictions = model.predict(features).tolist()
        probabilities = model.predict_proba(features).tolist()

        return PredictionResponse(
            predictions=predictions,
            probabilities=probabilities
        )
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/model/info")
async def model_info():
    return {
        "model_type": type(model).__name__,
        "n_features": model.n_features_in_ if hasattr(model, 'n_features_in_') else None,
        "n_classes": len(model.classes_) if hasattr(model, 'classes_') else None
    }
```

### Monitoring avec Evidently

```python
import pandas as pd
from evidently import ColumnMapping
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset, DataQualityPreset
from evidently.metrics import *
from datetime import datetime, timedelta
import json

class ModelMonitor:
    def __init__(self, reference_data: pd.DataFrame, column_mapping: ColumnMapping = None):
        self.reference_data = reference_data
        self.column_mapping = column_mapping or ColumnMapping()

    def generate_drift_report(
        self,
        current_data: pd.DataFrame,
        output_path: str = None
    ) -> dict:
        """Generate data drift report"""
        report = Report(metrics=[
            DataDriftPreset(),
            DataQualityPreset()
        ])

        report.run(
            reference_data=self.reference_data,
            current_data=current_data,
            column_mapping=self.column_mapping
        )

        if output_path:
            report.save_html(output_path)

        return report.as_dict()

    def check_data_drift(
        self,
        current_data: pd.DataFrame,
        threshold: float = 0.5
    ) -> bool:
        """Check if data drift exceeds threshold"""
        report = Report(metrics=[DatasetDriftMetric()])
        report.run(
            reference_data=self.reference_data,
            current_data=current_data,
            column_mapping=self.column_mapping
        )

        result = report.as_dict()
        drift_share = result['metrics'][0]['result']['share_of_drifted_columns']

        return drift_share > threshold

    def generate_model_performance_report(
        self,
        current_data: pd.DataFrame,
        predictions: pd.Series,
        target: pd.Series
    ) -> dict:
        """Generate model performance report"""
        current_data = current_data.copy()
        current_data['prediction'] = predictions
        current_data['target'] = target

        report = Report(metrics=[
            ClassificationQualityMetric(),
            ClassificationClassBalance(),
            ClassificationConfusionMatrix()
        ])

        report.run(
            reference_data=None,
            current_data=current_data,
            column_mapping=ColumnMapping(
                target='target',
                prediction='prediction'
            )
        )

        return report.as_dict()

# Prometheus metrics for monitoring
from prometheus_client import Counter, Histogram, Gauge
import time

# Define metrics
PREDICTION_COUNTER = Counter(
    'model_predictions_total',
    'Total number of predictions',
    ['model_name', 'model_version']
)

PREDICTION_LATENCY = Histogram(
    'model_prediction_latency_seconds',
    'Prediction latency in seconds',
    ['model_name']
)

DRIFT_SCORE = Gauge(
    'model_drift_score',
    'Current drift score',
    ['model_name', 'feature']
)

def track_prediction(model_name: str, model_version: str):
    """Decorator to track predictions"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            start_time = time.time()

            result = func(*args, **kwargs)

            latency = time.time() - start_time
            PREDICTION_COUNTER.labels(
                model_name=model_name,
                model_version=model_version
            ).inc()
            PREDICTION_LATENCY.labels(model_name=model_name).observe(latency)

            return result
        return wrapper
    return decorator
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ml-pipeline.yaml
name: ML Pipeline

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'configs/**'
      - 'tests/**'
  pull_request:
    branches: [main]
  workflow_dispatch:
    inputs:
      train_model:
        description: 'Train new model'
        required: false
        default: 'false'

env:
  MLFLOW_TRACKING_URI: ${{ secrets.MLFLOW_TRACKING_URI }}
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
  AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov

      - name: Run tests
        run: pytest tests/ --cov=src --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  data-validation:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install great_expectations pandas

      - name: Run data validation
        run: python src/data/validate.py

  train:
    runs-on: ubuntu-latest
    needs: data-validation
    if: github.event.inputs.train_model == 'true' || github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Train model
        run: |
          python src/models/train.py \
            --config configs/training_config.yaml

      - name: Evaluate model
        run: python src/models/evaluate.py

  deploy:
    runs-on: ubuntu-latest
    needs: train
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to SageMaker
        run: |
          python scripts/deploy_sagemaker.py \
            --model-uri "models:/production_model/Production" \
            --endpoint-name "ml-model-endpoint"
```

### Docker Compose pour MLOps Local

```yaml
# docker-compose.mlops.yaml
version: '3.8'

services:
  mlflow:
    image: ghcr.io/mlflow/mlflow:v2.9.0
    ports:
      - "5000:5000"
    environment:
      - MLFLOW_BACKEND_STORE_URI=postgresql://mlflow:mlflow@postgres:5432/mlflow
      - MLFLOW_DEFAULT_ARTIFACT_ROOT=s3://mlflow-artifacts/
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    command: mlflow server --host 0.0.0.0 --port 5000
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: mlflow
      POSTGRES_PASSWORD: mlflow
      POSTGRES_DB: mlflow
    volumes:
      - postgres_data:/var/lib/postgresql/data

  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  postgres_data:
  minio_data:
  grafana_data:
```

## Best Practices

```yaml
Version Control:
  - Versionner données avec DVC
  - Versionner modèles avec MLflow
  - Versionner configs avec Git
  - Tags sémantiques pour releases

Testing:
  - Unit tests pour preprocessing
  - Integration tests pour pipelines
  - Model validation tests
  - A/B testing en production

Monitoring:
  - Data drift detection continu
  - Model performance tracking
  - Latency et throughput
  - Alerting automatique

Security:
  - Secrets management (Vault)
  - Model access control
  - Audit logging
  - Encryption at rest/transit
```

## Workflow MLOps

```
1. DATA VERSIONING   → DVC, data validation
2. FEATURE STORE     → Feature engineering, serving
3. EXPERIMENT        → MLflow tracking, hyperparams
4. TRAINING          → Distributed, reproducible
5. VALIDATION        → Quality gates, A/B test
6. REGISTRY          → Model versioning, promotion
7. DEPLOYMENT        → Blue/green, canary
8. MONITORING        → Drift, performance, alerts
9. RETRAINING        → Automated triggers
```

---

*MLOps Engineer - ULTRA-CREATE v24.0 - Production ML Specialist*
