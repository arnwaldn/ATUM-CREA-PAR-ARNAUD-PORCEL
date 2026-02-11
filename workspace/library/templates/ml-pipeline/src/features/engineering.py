"""Feature engineering utilities."""

import pandas as pd
import numpy as np
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


class FeatureEngineer:
    """Feature engineering pipeline."""

    def __init__(self):
        self.feature_names: List[str] = []

    def add_datetime_features(
        self,
        df: pd.DataFrame,
        column: str
    ) -> pd.DataFrame:
        """Extract datetime features from a column."""
        df = df.copy()
        dt = pd.to_datetime(df[column])

        df[f"{column}_year"] = dt.dt.year
        df[f"{column}_month"] = dt.dt.month
        df[f"{column}_day"] = dt.dt.day
        df[f"{column}_dayofweek"] = dt.dt.dayofweek
        df[f"{column}_hour"] = dt.dt.hour
        df[f"{column}_is_weekend"] = (dt.dt.dayofweek >= 5).astype(int)

        logger.info(f"Added datetime features from {column}")
        return df

    def add_lag_features(
        self,
        df: pd.DataFrame,
        column: str,
        lags: List[int] = [1, 7, 30]
    ) -> pd.DataFrame:
        """Add lag features for time series."""
        df = df.copy()

        for lag in lags:
            df[f"{column}_lag_{lag}"] = df[column].shift(lag)

        logger.info(f"Added lag features for {column}: {lags}")
        return df

    def add_rolling_features(
        self,
        df: pd.DataFrame,
        column: str,
        windows: List[int] = [7, 30],
        functions: List[str] = ["mean", "std"]
    ) -> pd.DataFrame:
        """Add rolling window features."""
        df = df.copy()

        for window in windows:
            for func in functions:
                col_name = f"{column}_rolling_{window}_{func}"
                df[col_name] = df[column].rolling(window=window).agg(func)

        logger.info(f"Added rolling features for {column}")
        return df

    def add_polynomial_features(
        self,
        df: pd.DataFrame,
        columns: List[str],
        degree: int = 2
    ) -> pd.DataFrame:
        """Add polynomial features."""
        df = df.copy()

        for col in columns:
            for d in range(2, degree + 1):
                df[f"{col}_pow{d}"] = df[col] ** d

        # Add interaction terms for degree 2
        if degree >= 2 and len(columns) >= 2:
            for i, col1 in enumerate(columns):
                for col2 in columns[i + 1:]:
                    df[f"{col1}_x_{col2}"] = df[col1] * df[col2]

        logger.info(f"Added polynomial features (degree {degree}) for {columns}")
        return df

    def encode_categorical(
        self,
        df: pd.DataFrame,
        columns: Optional[List[str]] = None,
        method: str = "onehot"
    ) -> pd.DataFrame:
        """Encode categorical variables."""
        df = df.copy()

        if columns is None:
            columns = df.select_dtypes(include=["object", "category"]).columns.tolist()

        if method == "onehot":
            df = pd.get_dummies(df, columns=columns, drop_first=True)
        elif method == "label":
            for col in columns:
                df[col] = df[col].astype("category").cat.codes

        logger.info(f"Encoded categorical columns: {columns} using {method}")
        return df

    def remove_outliers(
        self,
        df: pd.DataFrame,
        columns: List[str],
        method: str = "iqr",
        threshold: float = 1.5
    ) -> pd.DataFrame:
        """Remove outliers from specified columns."""
        df = df.copy()
        mask = pd.Series([True] * len(df))

        for col in columns:
            if method == "iqr":
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower = Q1 - threshold * IQR
                upper = Q3 + threshold * IQR
                mask &= (df[col] >= lower) & (df[col] <= upper)
            elif method == "zscore":
                z_scores = np.abs((df[col] - df[col].mean()) / df[col].std())
                mask &= z_scores < threshold

        removed = len(df) - mask.sum()
        logger.info(f"Removed {removed} outliers using {method}")

        return df[mask]

    def fill_missing(
        self,
        df: pd.DataFrame,
        strategy: str = "mean",
        columns: Optional[List[str]] = None
    ) -> pd.DataFrame:
        """Fill missing values."""
        df = df.copy()

        if columns is None:
            columns = df.columns.tolist()

        for col in columns:
            if df[col].isna().sum() > 0:
                if strategy == "mean":
                    df[col] = df[col].fillna(df[col].mean())
                elif strategy == "median":
                    df[col] = df[col].fillna(df[col].median())
                elif strategy == "mode":
                    df[col] = df[col].fillna(df[col].mode()[0])
                elif strategy == "zero":
                    df[col] = df[col].fillna(0)
                elif strategy == "ffill":
                    df[col] = df[col].ffill()

        logger.info(f"Filled missing values using {strategy}")
        return df
