type ID = string;
type NodeID = ID;
type EdgeID = ID;
type GraphID = ID;

interface Size {
  width: number;
  height: number;
}

interface Point {
  left: number;
  top: number;
}

interface INode {
  name: string;
  radius: number;
  center: Point;
}

interface NodeProps extends INode {
  id: NodeID;
}

interface IEdge {
  fromNodeId: string;
  toNodeId: string;
}

interface EdgeProps extends IEdge {
  id: EdgeID;
}

interface GraphProps {
  nodeDict: NodeDict;
  edgeDict: EdgeDict;
}

interface NodeDict {
  [key: ID]: INode;
}

interface EdgeDict {
  [key: ID]: IEdge;
}

interface LoadButtonProps {
  nodes: NodeProps[];
  edges: EdgeProps[];
}

interface IArrow {
  id?: EdgeID;
  fromPoint: Point;
  toPoint: Point;
  fromOffset: number;
  toOffset: number;
}

interface CreatingArrow extends IArrow {
  fromNodeId: NodeID;
}

interface AdjacentDict {
  [key: NodeID]: NodeID[];
}

interface Table {
  [key: string]: number[];
}

interface InferenceResult {
  causal_effect?: number;
}

type InferenceMode =
  | "NaiveTreatmentEffect"
  | "AverageTreatmentEffect"
  | "LinearRegressionEffect";
