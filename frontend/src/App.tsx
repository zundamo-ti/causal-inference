import { v4 as uuid4 } from "uuid";
import { RecoilRoot } from "recoil";
import Graph from "./components/Graph";
import appStyles from "./styles/App.module.scss";
import Inference from "./components/Inference/Inference";
import Upload from "./components/Upload/Upload";

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
  const edgeDict: EdgeDict = {};

  return (
    <RecoilRoot>
      <div className={appStyles.app}>
        <Upload />
        <Inference />
        <Graph />
      </div>
    </RecoilRoot>
  );
}

export default App;
