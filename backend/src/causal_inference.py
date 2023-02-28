from enum import Enum

import networkx as nx
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from src.causal_identifier import find_minimum_backdoor_set
from src.errors import InvalidInferenceModeError


class InferenceMode(str, Enum):
    NaiveTreatmentEffect = "NaiveTreatmentEffect"
    AverageTreatmentEffect = "AverageTreatmentEffect"
    LinearRegressionEffect = "LinearRegressionEffect"


class CasualInference:
    """casual inference

    Attributes:
        df (pd.DataFrame): input data
        intervention_col (str): column name that indicates intervention
        target_col (str): column name that indicates target
        causal_graph (Optional[networkx.DiGraph]): causal graph of input data
    """

    def __init__(
        self,
        df: pd.DataFrame,
        intervention_col: str,
        target_col: str,
        causal_graph: nx.DiGraph,
    ) -> None:
        self.df = df
        self.intervention_col = intervention_col
        self.target_col = target_col
        self.other_cols = [
            col for col in df.columns if col not in [intervention_col, target_col]
        ]
        self.causal_graph = causal_graph

    def _calc_propensity_score(self) -> np.ndarray:
        adjustment_set = self._find_adjustment_set()
        X = self.df[adjustment_set]
        y = self.df[self.intervention_col]
        if len(adjustment_set) == 0:
            return y
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
        lr = LogisticRegression()
        lr.fit(X_train, y_train)
        y_pred = lr.predict(X_test)
        print(f"accuracy={accuracy_score(y_true=y_test, y_pred=y_pred)}")
        propensity_scores: np.ndarray = lr.predict_proba(X)[:, 1]
        return propensity_scores

    def _find_adjustment_set(self) -> list[str]:
        _, adjustment_set = find_minimum_backdoor_set(
            self.causal_graph, {self.intervention_col}, {self.target_col}
        )
        return list(adjustment_set)

    def linear_causal_effect(self) -> float:
        explain_cols = self._find_adjustment_set()
        explain_cols.append(self.intervention_col)
        X = self.df[explain_cols]
        y = self.df[self.target_col]
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
        rg = LinearRegression()
        rg.fit(X_train, y_train)
        causal_effect = float(rg.coef_[-1])
        return causal_effect

    def average_treatment_effect(self) -> float:
        """calculate average treatment effect by inverse probability weighting

        Returns:
            float: average treatment effect
        Examples:
            >>> from optimize.causal_inference import *
            >>> # make_sample_data
            >>> sample_data = make_sample_data(n_sample=1000, effect=0.1, seed=42)
            >>> ci = CasualInference(sample_data, "campaign", "buy")
            >>> # calculate average treatment effect by inverse probability weighting
            >>> print(ci.average_treatment_effect())
        """
        propensity_scores = self._calc_propensity_score()
        target = self.df[self.target_col].values
        intervention = self.df[self.intervention_col].values

        def calc(target_values: np.ndarray, proba: np.ndarray) -> float:
            sum_weighted_target: float = (target_values / proba).sum()
            sum_weights: float = ((1 / proba)).sum()
            return sum_weighted_target / sum_weights

        return calc(
            target[intervention == 1], propensity_scores[intervention == 1]
        ) - calc(target[intervention == 0], 1 - propensity_scores[intervention == 0])

    def naive_treatment_effect(self) -> float:
        intervented = self.df[self.intervention_col] == 1
        not_intervented = self.df[self.intervention_col] == 0
        return (
            self.df[self.target_col][intervented].mean()
            - self.df[self.target_col][not_intervented].mean()
        )

    def causal_effect(self, mode: InferenceMode) -> float:
        if mode == InferenceMode.NaiveTreatmentEffect:
            return self.naive_treatment_effect()
        if mode == InferenceMode.AverageTreatmentEffect:
            return self.average_treatment_effect()
        if mode == InferenceMode.LinearRegressionEffect:
            return self.linear_causal_effect()
        raise InvalidInferenceModeError


class MultiInterventionInference:
    def __init__(
        self,
        df: pd.DataFrame,
        intervention_cols: list[str],
        target_col: str,
        causal_graph: nx.DiGraph,
    ) -> None:
        self.df = df
        self.intervention_cols = intervention_cols
        self.target_col = target_col
        self.other_cols = [
            col for col in df.columns if col not in [intervention_cols, target_col]
        ]
        self.causal_graph = causal_graph

    def _find_adjustment_set(self) -> list[str]:
        _, adjustment_set = find_minimum_backdoor_set(
            self.causal_graph, set(self.intervention_cols), {self.target_col}
        )
        return list(adjustment_set)

    def causal_inference(self) -> list[float]:
        raise NotImplementedError
