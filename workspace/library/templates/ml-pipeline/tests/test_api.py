"""Tests for the serving API."""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import torch


@pytest.fixture
def mock_model():
    """Create a mock model."""
    model = MagicMock()
    model.eval = MagicMock()
    model.to = MagicMock(return_value=model)

    # Mock prediction output
    output = torch.tensor([[0.1, 0.9]])
    model.return_value = output

    return model


@pytest.fixture
def client(mock_model):
    """Create test client with mocked model."""
    with patch("mlflow.pytorch.load_model", return_value=mock_model):
        from src.serving.api import app
        yield TestClient(app)


def test_health_check(client):
    """Test health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_predict(client):
    """Test prediction endpoint."""
    response = client.post(
        "/predict",
        json={"features": [[1.0, 2.0, 3.0, 4.0]]}
    )
    assert response.status_code == 200
    data = response.json()
    assert "predictions" in data
    assert "probabilities" in data


def test_predict_batch(client):
    """Test batch prediction endpoint."""
    response = client.post(
        "/predict/batch",
        json={"features": [[1.0, 2.0], [3.0, 4.0]]}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["predictions"]) >= 1


def test_model_info(client):
    """Test model info endpoint."""
    response = client.get("/model/info")
    assert response.status_code == 200
    data = response.json()
    assert "model_type" in data
    assert "device" in data
