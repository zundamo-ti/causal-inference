from typing import TypeAlias

import networkx as nx
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from src.simultaneous_inference import SimultaneousCausalInference

app = FastAPI()

NodeID: TypeAlias = str
Table: TypeAlias = dict[str, list[float | int]]


class Edge(BaseModel):
    fromNode: NodeID
    toNode: NodeID


class Graph(BaseModel):
    nodes: list[NodeID]
    edges: list[Edge]


class InferenceRequest(BaseModel):
    table: Table
    graph: Graph
    treatments: list[NodeID]
    outcome: NodeID


class InferenceResponse(BaseModel):
    causal_effect: dict[NodeID, float]


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
