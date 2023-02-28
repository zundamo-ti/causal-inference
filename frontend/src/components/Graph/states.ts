import { atom, RecoilState, RecoilValueReadOnly, selector } from "recoil";

export const NodeDictState: RecoilState<NodeDict> = atom({
  key: "NodeDictState",
  default: {},
});

export const CreatingArrowState: RecoilState<{
  entity?: CreatingArrow;
}> = atom({
  key: "CreatingArrowState",
  default: {},
});

export const EdgeDictState: RecoilState<EdgeDict> = atom({
  key: "EdgeDictState",
  default: {},
});

export const LoadedState: RecoilState<boolean> = atom({
  key: "LoadedState",
  default: false,
});

export const AdjacentDictValue: RecoilValueReadOnly<AdjacentDict> = selector({
  key: "AdjacentDictValue",
  get: ({ get }) => {
    const edgeDict = get(EdgeDictState);
    const adjacentDict: AdjacentDict = {};
    Object.entries(edgeDict).forEach(([_, { fromNodeId, toNodeId }]) => {
      if (adjacentDict[fromNodeId]) adjacentDict[fromNodeId].push(toNodeId);
      else adjacentDict[fromNodeId] = [toNodeId];
    });
    return adjacentDict;
  },
});

export const TreatmentNodesState: RecoilState<{ id?: NodeID[] }> = atom({
  key: "TreatmentNodesState",
  default: {},
});

export const OutcomeNodeState: RecoilState<{ id?: NodeID }> = atom({
  key: "OutcomeNodeState",
  default: {},
});

export const GraphValue: RecoilValueReadOnly<{
  nodes: string[];
  edges: { fromNode: string; toNode: string }[];
}> = selector({
  key: "GraphValue",
  get: ({ get }) => {
    const nodeDict = get(NodeDictState);
    const edgeDict = get(EdgeDictState);
    const nodes = Object.entries(nodeDict).map(([_, { name }]) => name);
    const edges = Object.entries(edgeDict).map(
      ([_, { fromNodeId, toNodeId }]) => {
        return {
          fromNode: nodeDict[fromNodeId].name,
          toNode: nodeDict[toNodeId].name,
        };
      }
    );
    return { nodes, edges };
  },
});

export const TreatmentsValue: RecoilValueReadOnly<string[]> = selector({
  key: "TreatmentsValue",
  get: ({ get }) => {
    const nodeDict = get(NodeDictState);
    const treatmentNodeIDs = get(TreatmentNodesState);
    const ids = treatmentNodeIDs.id;
    if (!ids) return [];
    return ids.map((nodeID) => nodeDict[nodeID].name);
  },
});

export const OutcomeValue: RecoilValueReadOnly<string | null> = selector({
  key: "OutcomeValue",
  get: ({ get }) => {
    const nodeDict = get(NodeDictState);
    const outcomeNodeID = get(OutcomeNodeState).id;
    if (outcomeNodeID) return nodeDict[outcomeNodeID].name;
    return null;
  },
});
