from typing import TypeAlias

import networkx as nx
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel

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


@app.post("/inference")
async def parrot(req: InferenceRequest) -> None:
    df = pd.DataFrame(req.table)
    graph = nx.Graph()
    nodes = req.graph.nodes
    edges = list(map(lambda edge: (edge.fromNode, edge.toNode), req.graph.edges))
    graph.add_nodes_from(nodes)
    graph.add_edges_from(edges)
    print(f"{df=}")
    print(f"{graph.nodes=}")
    print(f"{graph.edges=}")
    print(f"{req.treatment=}")
    print(f"{req.outcome=}")
