import _ from "lodash";
import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { v4 as uuid4 } from "uuid";

import {
  AdjacentDictValue,
  CreatingArrowState,
  EdgeDictState,
  NodeDictState,
  OutcomeNodeState,
  TreatmentNodesState,
} from "./states";

import styles from "../../styles/components/Graph/Node.module.scss";
import { checkAcyclicity, checkMultiplicity } from "./utils";

export default function Node({ id, name, radius, center }: NodeProps) {
  const [nodeDict, setNodeDict] = useRecoilState(NodeDictState);
  const [edgeDict, setEdgeDict] = useRecoilState(EdgeDictState);
  const [creatingArrow, setCreatingArrowState] =
    useRecoilState(CreatingArrowState);
  const [treatmentNodes, setTreatmentNodes] =
    useRecoilState(TreatmentNodesState);
  const [outcomeNode, setOutcomeNode] = useRecoilState(OutcomeNodeState);
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
    const ids = treatmentNodes.id;
    if (!ids || !ids?.includes(id)) {
      const treatment = confirm("介入変数に設定しますか？");
      if (treatment) {
        if (ids) {
          setTreatmentNodes({ id: [...ids, id] });
        } else {
          setTreatmentNodes({ id: [id] });
        }
        if (outcomeNode.id === id) {
          setOutcomeNode({});
        }
        return;
      }
    }
    if (outcomeNode.id !== id) {
      const outcome = confirm("アウトカム変数に設定しますか？");
      if (outcome) {
        setOutcomeNode({ id });
        if (ids?.includes(id)) {
          setTreatmentNodes({ id: ids.filter((v) => v != id) });
        }
        return;
      }
    }
  };

  return (
    <>
      <div
        className={`${styles.node} ${
          treatmentNodes.id?.includes(id) ? styles.treatment : ""
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
