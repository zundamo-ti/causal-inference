import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import styles from "../../styles/components/Inference/Button.module.scss";
import { GraphValue } from "../Graph";
import { OutcomeValue, TreatmentsValue } from "../Graph/states";
import { TableState } from "../Upload/states";
import { InferenceModeState, InferenceResultState } from "./states";

function isInferenceMode(object: any): object is InferenceMode {
  return (
    object === "NaiveTreatmentEffect" ||
    object === "AverageTreatmentEffect" ||
    object === "LinearRegressionEffect"
  );
}

export default function InferenceButton() {
  const graph = useRecoilValue(GraphValue);
  const table = useRecoilValue(TableState);
  const treatments = useRecoilValue(TreatmentsValue);
  const outcome = useRecoilValue(OutcomeValue);
  const [inferenceResult, setInferenceResult] =
    useRecoilState(InferenceResultState);
  const [inferenceMode, setInferenceMode] = useRecoilState(InferenceModeState);

  useEffect(() => setInferenceMode({ mode: "NaiveTreatmentEffect" }), []);

  return (
    <div className={styles.button}>
      <select
        onChange={(e) => {
          const mode = e.target.value;
          if (!isInferenceMode(mode)) return;
          setInferenceMode({ mode });
        }}
      >
        <option>{"NaiveTreatmentEffect"}</option>
        <option>{"AverageTreatmentEffect"}</option>
        <option>{"LinearRegressionEffect"}</option>
      </select>
      <button
        onClick={async () => {
          const mode = inferenceMode.mode;
          if (treatments.length === 0) {
            alert("介入変数を選択してください");
            return;
          }
          if (!outcome) {
            alert("アウトカム変数を選択してください");
            return;
          }
          if (!mode) {
            alert("推論モードを選択してください");
            return;
          }
          const res = await fetch("/api/inference", {
            method: "post",
            body: JSON.stringify({ graph, table, treatments, outcome, mode }),
            headers: {
              "Content-Type": "application/json",
            },
          });
          const obj = await res.json();
          setInferenceResult(obj);
        }}
      >
        Inference
      </button>
    </div>
  );
}
