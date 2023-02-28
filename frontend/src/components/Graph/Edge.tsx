import _ from "lodash";
import { useRecoilState, useRecoilValue } from "recoil";
import { EdgeDictState, NodeDictState } from "./states";

import styles from "../../styles/components/Graph/Edge.module.scss";

export function CreatingArrow({
  fromPoint,
  toPoint,
  fromOffset,
  toOffset,
}: IArrow) {
  const midPoint = {
    left: (fromPoint.left + toPoint.left) / 2,
    top: (fromPoint.top + toPoint.top) / 2,
  };
  const length =
    ((toPoint.left - fromPoint.left) ** 2 +
      (toPoint.top - fromPoint.top) ** 2) **
    0.5;
  const angle =
    Math.atan2(toPoint.top - fromPoint.top, toPoint.left - fromPoint.left) *
    (180 / Math.PI);
  const thickness = 2;
  const headSize: Size = { width: 10, height: 20 };

  return (
    <div className={styles.edge}>
      <div
        className={styles.line}
        style={{
          height: `${thickness}px`,
          width: `${length - fromOffset - toOffset}px`,
          left: `${midPoint.left - length / 2 + fromOffset}px`,
          top: `${midPoint.top - thickness / 2}px`,
          rotate: `${angle}deg`,
          transformOrigin: `${length / 2 - fromOffset}px ${thickness / 2}px`,
        }}
      ></div>
      <div
        className={styles.head}
        style={{
          borderTop: `${headSize.height / 2}px solid transparent`,
          borderBottom: `${headSize.height / 2}px solid transparent`,
          borderLeft: `${headSize.width}px solid #000000`,
          left: `${midPoint.left + length / 2 - headSize.width - toOffset}px`,
          top: `${midPoint.top - headSize.height / 2}px`,
          rotate: `${angle}deg`,
          transformOrigin: `${-length / 2 + toOffset + headSize.width}px ${
            headSize.height / 2
          }px`,
        }}
      ></div>
    </div>
  );
}

export function Arrow({
  id,
  fromPoint,
  toPoint,
  fromOffset,
  toOffset,
}: IArrow) {
  const midPoint = {
    left: (fromPoint.left + toPoint.left) / 2,
    top: (fromPoint.top + toPoint.top) / 2,
  };
  const length =
    ((toPoint.left - fromPoint.left) ** 2 +
      (toPoint.top - fromPoint.top) ** 2) **
    0.5;
  const angle =
    Math.atan2(toPoint.top - fromPoint.top, toPoint.left - fromPoint.left) *
    (180 / Math.PI);
  const thickness = 2;
  const hitBoxThickness = 25;
  const headSize: Size = { width: 10, height: 20 };

  const [edgeDict, setEdgeDict] = useRecoilState(EdgeDictState);

  return (
    <div className={styles.edge}>
      <div
        className={styles.hitBox}
        style={{
          height: `${hitBoxThickness}px`,
          width: `${length - fromOffset - toOffset + 10}px`,
          left: `${midPoint.left - length / 2 + fromOffset - 5}px`,
          top: `${midPoint.top - hitBoxThickness / 2}px`,
          rotate: `${angle}deg`,
          transformOrigin: `${length / 2 - fromOffset + 5}px ${
            hitBoxThickness / 2
          }px`,
        }}
        onClick={() => {
          if (!id) return;
          const deleteEdge = confirm(`消去しますか？`);
          if (deleteEdge) {
            setEdgeDict(_.omit(edgeDict, [id]));
          }
        }}
      ></div>
      <div
        className={styles.line}
        style={{
          height: `${thickness}px`,
          width: `${length - fromOffset - toOffset}px`,
          left: `${midPoint.left - length / 2 + fromOffset}px`,
          top: `${midPoint.top - thickness / 2}px`,
          rotate: `${angle}deg`,
          transformOrigin: `${length / 2 - fromOffset}px ${thickness / 2}px`,
        }}
      ></div>
      <div
        className={styles.head}
        style={{
          borderTop: `${headSize.height / 2}px solid transparent`,
          borderBottom: `${headSize.height / 2}px solid transparent`,
          borderLeft: `${headSize.width}px solid #000000`,
          left: `${midPoint.left + length / 2 - headSize.width - toOffset}px`,
          top: `${midPoint.top - headSize.height / 2}px`,
          rotate: `${angle}deg`,
          transformOrigin: `${-length / 2 + toOffset + headSize.width}px ${
            headSize.height / 2
          }px`,
        }}
      ></div>
    </div>
  );
}

export default function Edge({
  id,
  fromNodeId: defaultFromNodeID,
  toNodeId: defaultToNodeID,
}: EdgeProps) {
  const nodeDict = useRecoilValue(NodeDictState);
  const edgeDict = useRecoilValue(EdgeDictState);

  const fromNodeId = edgeDict[id] ? edgeDict[id].fromNodeId : defaultFromNodeID;
  const toNodeId = edgeDict[id] ? edgeDict[id].toNodeId : defaultToNodeID;

  const fromNode = nodeDict[fromNodeId];
  const toNode = nodeDict[toNodeId];

  return (
    <Arrow
      id={id}
      fromPoint={fromNode.center}
      toPoint={toNode.center}
      fromOffset={fromNode.radius + 10}
      toOffset={toNode.radius + 10}
    />
  );
}
