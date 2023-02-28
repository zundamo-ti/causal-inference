from typing import TypeAlias

import networkx as nx
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from src.simultaneous_inference import SimultaneousCausalInference

app = FastAPI()

Table: TypeAlias = dict[str, list[float | int]]


class Edge(BaseModel):
    fromNode: str
    toNode: str


class Graph(BaseModel):
    nodes: list[str]
    edges: list[Edge]


class InferenceRequest(BaseModel):
    table: Table
    graph: Graph
    treatments: list[str]
    outcome: str


class InferenceResponse(BaseModel):
    causal_effect: dict[str, float]


@app.post("/inference")
async def average_treatment_effect(req: InferenceRequest) -> InferenceResponse:
    df = pd.DataFrame(req.table)
    graph = nx.DiGraph()
    nodes = req.graph.nodes
    edges = list(map(lambda edge: (edge.fromNode, edge.toNode), req.graph.edges))
    graph.add_nodes_from(nodes)
    graph.add_edges_from(edges)
    ci = SimultaneousCausalInference(df, req.treatments, req.outcome, graph)
    res = InferenceResponse(causal_effect=ci.causal_effect())
    return res
