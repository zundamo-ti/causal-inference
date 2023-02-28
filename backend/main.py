from typing import TypeAlias

import networkx as nx
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from src.causal_inference import CasualInference, InferenceMode

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
    treatment: str
    outcome: str
    mode: InferenceMode


class InferenceResponse(BaseModel):
    causal_effect: float


@app.post("/inference")
async def average_treatment_effect(req: InferenceRequest) -> InferenceResponse:
    df = pd.DataFrame(req.table)
    graph = nx.DiGraph()
    nodes = req.graph.nodes
    edges = list(map(lambda edge: (edge.fromNode, edge.toNode), req.graph.edges))
    graph.add_nodes_from(nodes)
    graph.add_edges_from(edges)
    ci = CasualInference(df, req.treatment, req.outcome, graph)
    res = InferenceResponse(causal_effect=ci.causal_effect(mode=req.mode))
    return res
