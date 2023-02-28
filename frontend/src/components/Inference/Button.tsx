import { useRecoilState, useRecoilValue } from "recoil";
import styles from "../../styles/components/Inference/Button.module.scss";
import { GraphValue } from "../Graph";
import { OutcomeValue, TreatmentsValue } from "../Graph/states";
import { TableState } from "../Upload/states";
import { InferenceResultState } from "./states";

export default function InferenceButton() {
  const graph = useRecoilValue(GraphValue);
  const table = useRecoilValue(TableState);
  const treatments = useRecoilValue(TreatmentsValue);
  const outcome = useRecoilValue(OutcomeValue);
  const [inferenceResult, setInferenceResult] =
    useRecoilState(InferenceResultState);

  return (
    <div className={styles.button}>
      <button
        onClick={async () => {
          if (treatments.length === 0) {
            alert("介入変数を選択してください");
            return;
          }
          if (!outcome) {
            alert("アウトカム変数を選択してください");
            return;
          }
          const res = await fetch("/api/inference", {
            method: "post",
            body: JSON.stringify({ graph, table, treatments, outcome }),
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
