import { RecoilRoot } from "recoil";
import { v4 as uuid4 } from "uuid";
import { Graph } from "./components/Graph";
import {
  InferenceButton,
  InferenceResultDisplayer,
} from "./components/Inference";
import { Upload } from "./components/Upload";
import appStyles from "./styles/App.module.scss";

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
        <InferenceButton />
        <InferenceResultDisplayer />
        <Graph />
      </div>
    </RecoilRoot>
  );
}

export default App;
