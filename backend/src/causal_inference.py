import itertools
from typing import TypeVar

from typing import Optional

import networkx as nx
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split


TNode = TypeVar("TNode")
AugmentedTNode = tuple[TNode, str]


def find_minimum_d_separator(
    G: nx.DiGraph, X: set[TNode], Y: set[TNode]
) -> tuple[float, set[TNode]]:
    """Find minimum d-separator

    Args:
        G (nx.DiGraph): Causal graph DAG. possibly has costs with each node.
                        If not specified, the same cost 1 are assigned for each node.
        X (set[TNode]): First subset of nodes in G.
        Y (set[TNode]): Second subset of nodes in G.

    Returns:
        tuple: A tuple containing:
            cost_of_nodes (float): The minimum cost of nodes of d-separator.
            d_separator (set[TNode]): A d-separator with the minimum cost.
    Raises:
        ValueError: If X intersect with Y.
    """
    if X.intersection(Y):
        raise ValueError("the intersection of X and Y is non-empty.")
    for x, y in itertools.product(X, Y):
        if G.has_edge(x, y) or G.has_edge(y, x):
            raise ValueError(
                "all nodes x and y in X and Y respectively should not be adjacent."
            )
    ancestral_nodes = X | Y
    for x in X:
        ancestral_nodes |= nx.ancestors(G, x)
    for y in Y:
        ancestral_nodes |= nx.ancestors(G, y)
    directed_ancestral_graph: nx.DiGraph = G.subgraph(ancestral_nodes)
    moral_graph = directed_ancestral_graph.to_undirected()
    for u in ancestral_nodes:
        for v1, v2 in itertools.combinations(G.predecessors(u), 2):
            moral_graph.add_edge(v1, v2)
    auxiliary_nodes = set(map(lambda x: (x, "+"), moral_graph.nodes)) | set(
        map(lambda x: (x, "-"), moral_graph.nodes)
    )
    source = (..., "source")
    sink = (..., "sink")
    auxiliary_nodes.add(source)
    auxiliary_nodes.add(sink)
    auxiliaray_graph = nx.DiGraph()
    auxiliaray_graph.add_nodes_from(auxiliary_nodes)
    for x in X:
        auxiliaray_graph.add_edge(source, (x, "-"))
    for y in Y:
        auxiliaray_graph.add_edge((y, "+"), sink)
    for node in moral_graph.nodes:
        if "cost" in moral_graph.nodes[node]:
            cost: float = moral_graph.nodes[node]["cost"]
            auxiliaray_graph.add_edge((node, "+"), (node, "-"), cost=cost)
        else:
            auxiliaray_graph.add_edge((node, "+"), (node, "-"), cost=1.0)
    for node1, node2 in moral_graph.edges:
        auxiliaray_graph.add_edge((node1, "-"), (node2, "+"))
        auxiliaray_graph.add_edge((node2, "-"), (node1, "+"))
    min_cut: tuple[
        float, tuple[set[AugmentedTNode], set[AugmentedTNode]]
    ] = nx.minimum_cut(auxiliaray_graph, source, sink, capacity="cost")
    cost_of_nodes, partition = min_cut
    reachable, non_reachable = partition
    cutset: set[tuple[AugmentedTNode, AugmentedTNode]] = set()
    for u_reachable, nbrs in ((n, auxiliaray_graph[n]) for n in reachable):
        cutset.update((u_reachable, v) for v in nbrs if v in non_reachable)
    d_separator: set[TNode] = set(map(lambda t: t[0][0], cutset))  # type: ignore
    return cost_of_nodes, d_separator


def find_minimum_backdoor_set(
    G: nx.DiGraph, X: set[TNode], Y: set[TNode]
) -> tuple[float, set[TNode]]:
    """Find minimum backdoor set

    Args:
        G (nx.DiGraph): Causal graph DAG.
        X (set[TNode]): First subset of nodes in G.
        Y (set[TNode]): Second subset of nodes in G.

    Returns:
        tuple: A tuple containing:
            cost_of_nodes (float): The cost of nodes of d-separator.
            adjustment_set (set[TNode]): A adjustment set with minimum cardinality.
    """
    remove_nodes = set()
    for x in X:
        remove_nodes |= nx.descendants(G, x)
    remove_nodes -= Y
    not_descendants = G.nodes - remove_nodes
    essential_graph: nx.DiGraph = G.subgraph(not_descendants).copy()
    for x, y in itertools.product(X, Y):
        if essential_graph.has_edge(x, y):
            essential_graph.remove_edge(x, y)
    number_of_nodes, adjustment_set = find_minimum_d_separator(essential_graph, X, Y)
    return number_of_nodes, adjustment_set


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
        causal_graph: Optional[nx.DiGraph] = None,
    ) -> None:
        self.df = df
        self.intervention_col = intervention_col
        self.target_col = target_col
        self.other_cols = [
            col for col in df.columns if col not in [intervention_col, target_col]
        ]
        if causal_graph is not None:
            self.causal_graph = causal_graph
        else:
            self.causal_graph = nx.DiGraph()
            self.causal_graph.add_nodes_from(df.columns)
            self.causal_graph.add_edges_from(
                [(col, intervention_col) for col in self.other_cols]
            )
            self.causal_graph.add_edges_from(
                [(col, target_col) for col in self.other_cols]
            )

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
