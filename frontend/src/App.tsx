import { v4 as uuid4 } from "uuid";
import { RecoilRoot, useRecoilValue } from "recoil";
import Graph from "./components/Graph";
import appStyles from "./styles/App.module.scss";
import Inference from "./components/Inference/Inference";
import Upload from "./components/Upload/Upload";
import { InferenceResultState } from "./components/Inference/states";

function InferenceResultDisplayer() {
  const inferenceResult = useRecoilValue(InferenceResultState);

  return (
    <>
      {inferenceResult.ATE && <div>ATE:{inferenceResult.ATE.toFixed(2)}</div>}
      {inferenceResult.NAIVE && (
        <div>NAIVE:{inferenceResult.NAIVE.toFixed(2)}</div>
      )}
    </>
  );
}

function App() {
  const nodeNames = ["貧困率", "犯罪発生率", "平均寿命"];
  const nodeDict: NodeDict = {};
  nodeNames.forEach((name, index) => {
    nodeDict[uuid4()] = {
      name,
      radius: 50,
      center: { left: 50 + (1 + index) * 150, top: 150 },
    };
  });

  return (
    <RecoilRoot>
      <div className={appStyles.app}>
        <h1>Treatment Effect Optimization</h1>
        <Upload />
        <Inference />
        <InferenceResultDisplayer />
        <Graph />
      </div>
    </RecoilRoot>
  );
}

export default App;
