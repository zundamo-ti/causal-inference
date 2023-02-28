function visitedFromNode(
  nodeID: NodeID,
  adjacentDict: AdjacentDict,
  visited: { [key: NodeID]: boolean }
) {
  visited[nodeID] = true;
  if (!adjacentDict[nodeID]) return;
  for (let nextNodeID of adjacentDict[nodeID]) {
    if (visited[nextNodeID]) continue;
    visitedFromNode(nextNodeID, adjacentDict, visited);
  }
}

export function checkAcyclicity(
  edge: IEdge,
  adjacentDict: AdjacentDict
): boolean {
  let visited: { [key: NodeID]: boolean } = {};
  visitedFromNode(edge.toNodeId, adjacentDict, visited);
  if (visited[edge.fromNodeId]) return false;
  return true;
}

export function checkMultiplicity(
  edge: IEdge,
  adjacentDict: AdjacentDict
): boolean {
  const adjacentNodes = adjacentDict[edge.fromNodeId];
  if (!adjacentNodes) return false;
  return adjacentNodes.includes(edge.toNodeId);
}

function visitedFromNodeRemovingEdge(
  nodeID: NodeID,
  adjacentDict: AdjacentDict,
  visited: { [key: NodeID]: boolean },
  removingEdge: IEdge
) {
  visited[nodeID] = true;
  if (!adjacentDict[nodeID]) return;
  for (let nextNodeID of adjacentDict[nodeID]) {
    if (visited[nextNodeID]) continue;
    if (
      nodeID === removingEdge.fromNodeId &&
      nextNodeID === removingEdge.toNodeId
    )
      continue;
    visitedFromNode(nextNodeID, adjacentDict, visited);
  }
}

export function checkAcyclicityRemovingEdge(
  edge: IEdge,
  adjacentDict: AdjacentDict,
  removingEdge: IEdge
): boolean {
  let visited: { [key: NodeID]: boolean } = {};
  visitedFromNodeRemovingEdge(
    edge.toNodeId,
    adjacentDict,
    visited,
    removingEdge
  );
  if (visited[edge.fromNodeId]) return false;
  return true;
}
