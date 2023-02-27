import _ from "lodash";
import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { v4 as uuid4 } from "uuid";

import {
  NodeDictState,
  CreatingArrowState,
  EdgeDictState,
  AdjacentDictValue,
  TreatmentNodeState,
  OutcomeNodeState,
} from "./states";

import styles from "../../styles/components/Graph/Node.module.scss";

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

function checkAcyclicity(edge: IEdge, adjacentDict: AdjacentDict): boolean {
  let visited: { [key: NodeID]: boolean } = {};
  visitedFromNode(edge.toNodeId, adjacentDict, visited);
  if (visited[edge.fromNodeId]) return false;
  return true;
}

function checkMultiplicity(edge: IEdge, adjacentDict: AdjacentDict): boolean {
  const adjacentNodes = adjacentDict[edge.fromNodeId];
  if (!adjacentNodes) return false;
  return adjacentNodes.includes(edge.toNodeId);
}

export default function Node({ id, name, radius, center }: NodeProps) {
  const [nodeDict, setNodeDict] = useRecoilState(NodeDictState);
  const [edgeDict, setEdgeDict] = useRecoilState(EdgeDictState);
  const [creatingArrow, setCreatingArrowState] =
    useRecoilState(CreatingArrowState);
  const [treatmentNode, setTreatmentNode] = useRecoilState(TreatmentNodeState);
  const [outcomeNode, setOutcomNode] = useRecoilState(OutcomeNodeState);
  const adjacentDict = useRecoilValue(AdjacentDictValue);

  const startDraggingNode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.button !== 0) return;
    window.addEventListener("mousemove", onDraggingNode);
    window.addEventListener("mouseup", finishDraggingNode);
  };

  const onDraggingNode = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNodeDict((nodes) => {
      const newNodes = _.merge({}, nodes);
      newNodes[id] = {
        name,
        radius,
        center: { left: e.clientX, top: e.clientY },
      };
      return newNodes;
    });
  };

  const finishDraggingNode = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.removeEventListener("mousemove", onDraggingNode);
    window.removeEventListener("mouseup", finishDraggingNode);
  };

  const startCreatingEdge = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.addEventListener("mousemove", onCreatingEdge);
    window.addEventListener("mousedown", finishCreatingEdge);
  };

  const onCreatingEdge = (e: MouseEvent) => {
    const fromPoint = nodeDict[id].center;
    const fromOffset = radius;
    const toPoint: Point = { left: e.clientX, top: e.clientY };
    const toOffset = 0;
    setCreatingArrowState({
      entity: {
        fromPoint,
        toPoint,
        fromOffset,
        toOffset,
        fromNodeId: id,
      },
    });
  };

  const finishCreatingEdge = (e: MouseEvent) => {
    window.removeEventListener("mousemove", onCreatingEdge);
    window.removeEventListener("mousedown", finishCreatingEdge);
    setCreatingArrowState({ entity: undefined });
  };

  const createEdge = (e: React.MouseEvent, fromNodeId: ID) => {
    if (id === fromNodeId) return;
    const toNodeId = id;
    const edge = { fromNodeId, toNodeId };
    if (checkMultiplicity(edge, adjacentDict)) {
      // alert("すでに因果関係があります");
      return;
    }
    if (!checkAcyclicity(edge, adjacentDict)) {
      alert("因果が循環しています");
      return;
    }
    const newEdgeDict = _.merge({}, edgeDict);
    const newEdgeId = uuid4();
    newEdgeDict[newEdgeId] = edge;
    setEdgeDict(newEdgeDict);
  };

  const setTreatmentOrOutcome = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (treatmentNode.id && !outcomeNode.id) {
      const outcome = confirm("アウトカム変数に設定しますか？");
      if (outcome) {
        setOutcomNode({ id });
        return;
      }
      const treatment = confirm("介入変数に設定しますか？");
      if (treatment) {
        setTreatmentNode({ id });
        return;
      }
    } else {
      const treatment = confirm("介入変数に設定しますか？");
      if (treatment) {
        setTreatmentNode({ id });
        return;
      }
      const outcome = confirm("アウトカム変数に設定しますか？");
      if (outcome) {
        setOutcomNode({ id });
        return;
      }
    }
  };

  return (
    <>
      <div
        className={`${styles.node} ${
          treatmentNode.id === id ? styles.treatment : ""
        } ${outcomeNode.id === id ? styles.outcome : ""}`}
        style={{
          width: `${2 * radius}px`,
          height: `${2 * radius}px`,
          left: `${
            nodeDict[id] ? nodeDict[id].center.left - radius : center.left
          }px`,
          top: `${
            nodeDict[id] ? nodeDict[id].center.top - radius : center.top
          }px`,
        }}
        onMouseDown={(e) => {
          if (creatingArrow.entity) {
            const { fromNodeId } = creatingArrow.entity;
            createEdge(e, fromNodeId);
          } else {
            startDraggingNode(e);
          }
        }}
        onDoubleClick={(e) => startCreatingEdge(e)}
        onContextMenu={(e) => setTreatmentOrOutcome(e)}
      >
        {name}
      </div>
    </>
  );
}
