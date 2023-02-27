import { useRecoilValue } from "recoil";
import { GraphValue } from "../Graph";
import { OutcomeValue, TreatmentValue } from "../Graph/states";
import { TableState } from "../Upload/states";

export default function Inference() {
  const graph = useRecoilValue(GraphValue);
  const table = useRecoilValue(TableState);
  const treatment = useRecoilValue(TreatmentValue);
  const outcome = useRecoilValue(OutcomeValue);

  return (
    <div>
      <button
        onClick={async () => {
          if (!treatment) {
            alert("介入変数を選択してください");
            return;
          }
          if (!outcome) {
            alert("アウトカム変数を選択してください");
            return;
          }
          const res = await fetch("/api/inference", {
            method: "post",
            body: JSON.stringify({ graph, table, treatment, outcome }),
            headers: {
              "Content-Type": "application/json",
            },
          });
          const obj = await res.json();
        }}
      >
        Inference
      </button>
    </div>
  );
}
