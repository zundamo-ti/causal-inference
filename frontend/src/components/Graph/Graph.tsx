import { v4 as uuid4 } from "uuid";
import React, { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { NodeDictState, CreatingArrowState, EdgeDictState } from "./states";
import Node from "./Node";
import Edge, { CreatingArrow } from "./Edge";
import { TableState } from "../Upload/states";
import styles from "../../styles/components/Graph/Graph.module.scss";

export default function Graph() {
  const creatingArrow = useRecoilValue(CreatingArrowState);
  const table = useRecoilValue(TableState);
  const [nodeDict, setNodeDict] = useRecoilState(NodeDictState);
  const edgeDict = useRecoilValue(EdgeDictState);

  useEffect(() => {
    const defaultNodeDict: NodeDict = {};
    Object.keys(table).forEach((name, index) => {
      defaultNodeDict[uuid4()] = {
        name,
        radius: 50,
        center: {
          left: 100 + (index + 1) * 150,
          top: 300,
        },
      };
    });
    setNodeDict(defaultNodeDict);
  }, [table]);

  return (
    <div className={styles.graph}>
      {nodeDict &&
        Object.entries(nodeDict).map(([id, { name, radius, center }]) => {
          return (
            <Node
              key={id}
              id={id}
              name={name}
              radius={radius}
              center={center}
            />
          );
        })}
      {edgeDict &&
        Object.entries(edgeDict).map(([id, { fromNodeId, toNodeId }]) => {
          return (
            <Edge
              key={id}
              id={id}
              fromNodeId={fromNodeId}
              toNodeId={toNodeId}
            />
          );
        })}
      {creatingArrow.entity && (
        <CreatingArrow
          fromPoint={creatingArrow.entity.fromPoint}
          toPoint={creatingArrow.entity.toPoint}
          fromOffset={creatingArrow.entity.fromOffset + 10}
          toOffset={creatingArrow.entity.toOffset + 10}
        />
      )}
    </div>
  );
}
