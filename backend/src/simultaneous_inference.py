from typing import Optional

import networkx as nx
import numpy as np
import pandas as pd
from src.causal_identifier import find_admissible_variables
from src.errors import CannotDetermineCausalEffectError


class SimultaneousCausalInference:
    """casual effect regressor

    Attributes:
        df (pd.DataFrame): input self.df
        intervention_cols (list[str]): column name that indicates intervention
        target_col (str): column name that indicates target
        causal_graph (Optional[networkx.DiGraph]): causal graph of input self.df
    """

    def __init__(
        self,
        df: pd.DataFrame,
        intervention_cols: list[str],
        target_col: str,
        causal_graph: Optional[nx.DiGraph] = None,
    ) -> None:
        self.df = df
        self._intervention_cols = intervention_cols
        self.target_col = target_col
        self.other_cols = [
            col for col in df.columns if col not in intervention_cols + [target_col]
        ]
        if causal_graph is not None:
            self.causal_graph = causal_graph
        else:
            self.causal_graph = nx.DiGraph()
            self.causal_graph.add_nodes_from(df.columns)
            self.causal_graph.add_edges_from(
                [
                    (col, intervention_col)
                    for col, intervention_col in zip(self.other_cols, intervention_cols)
                ]
            )
            self.causal_graph.add_edges_from(
                [(col, target_col) for col in self.other_cols]
            )
            self.causal_graph.add_edges_from(
                [
                    (intervention_col, target_col)
                    for intervention_col in intervention_cols
                ]
            )
        self.intervention_cols = self.sorted_intervention_cols()

    def sorted_intervention_cols(self) -> list[str]:
        sorted_cols = list(nx.topological_sort(self.causal_graph))
        return [col for col in sorted_cols if col in self._intervention_cols]

    def causal_effect(self) -> dict[str, float]:
        num_intevention_cols = len(self.intervention_cols)
        admissible_cols = find_admissible_variables(
            self.causal_graph, self.intervention_cols, self.target_col
        )
        df_mean = self.df.mean()
        df_std = self.df.std()
        ordinal_cols = list(df_std[df_std != 0.0].index)
        constant_cols = list(df_std[df_std == 0.0].index)
        df_norm = (self.df[ordinal_cols] - df_mean[ordinal_cols]) / df_std[ordinal_cols]
        _intervention_cols = []
        _admissible_cols = []
        df_intervention_coeffs = pd.DataFrame()
        df_admissible_coeffs = pd.DataFrame()
        for i in range(1, num_intevention_cols + 1):
            if self.intervention_cols[i - 1] not in constant_cols:
                _intervention_cols.append(self.intervention_cols[i - 1])
            _admissible_cols += admissible_cols[i - 1]
            explain_cols = _intervention_cols + _admissible_cols
            if i < num_intevention_cols:
                objective_cols = admissible_cols[i]
            else:
                objective_cols = [self.target_col]
            x = df_norm[explain_cols]
            y = df_norm[objective_cols]
            cov_xx: pd.DataFrame = x.transpose() @ x
            cov_xy: pd.DataFrame = x.transpose() @ y
            try:
                _coeff = pd.DataFrame(
                    np.linalg.solve(cov_xx, cov_xy),
                    columns=objective_cols,
                    index=explain_cols,
                )
            except np.linalg.LinAlgError:
                raise CannotDetermineCausalEffectError
            df_intervention_coeffs = pd.concat(
                [
                    df_intervention_coeffs,
                    _coeff.loc[_intervention_cols]
                    .div(df_std[_intervention_cols], axis=0)
                    .mul(df_std[objective_cols], axis=1),
                ],
                axis=1,
            )
            df_admissible_coeffs = pd.concat(
                [
                    df_admissible_coeffs,
                    _coeff.loc[_admissible_cols]
                    .div(df_std[_admissible_cols], axis=0)
                    .mul(df_std[objective_cols], axis=1),
                ],
                axis=1,
            )
        df_intervention_coeffs = df_intervention_coeffs.fillna(0.0)
        df_admissible_coeffs = df_admissible_coeffs.fillna(0.0)
        union_admissible_cols: list[str] = sum(admissible_cols, start=[])
        extended_admissible_cols = union_admissible_cols + [self.target_col]
        df_extended_intervention_coeffs = (
            (
                pd.DataFrame(
                    index=self.intervention_cols,
                    columns=extended_admissible_cols,
                ).fillna(0.0)
                + df_intervention_coeffs
            )
            .fillna(0.0)
            .transpose()
            .loc[
                extended_admissible_cols[::-1],
                self.intervention_cols[::-1],
            ]
        )
        df_extended_admissible_coeffs = (
            (
                pd.DataFrame(
                    index=extended_admissible_cols,
                    columns=extended_admissible_cols,
                ).fillna(0.0)
                + df_admissible_coeffs
            )
            .fillna(0.0)
            .transpose()
            .loc[
                extended_admissible_cols[::-1],
                extended_admissible_cols[::-1],
            ]
        )
        causal_effect = pd.Series(
            np.linalg.solve(
                np.identity(df_extended_admissible_coeffs.shape[0], dtype=np.float32)
                - df_extended_admissible_coeffs,
                df_extended_intervention_coeffs,
            )[0],
            index=self.intervention_cols[::-1],
        ).loc[self.intervention_cols]
        causal_effect[constant_cols] = np.nan
        return causal_effect.to_dict()
