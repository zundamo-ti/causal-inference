import { useRecoilValue } from "recoil";
import { v4 as uuid4 } from "uuid";
import styles from "../../styles/components/Inference/Result.module.scss";
import { TreatmentsValue } from "../Graph/states";
import { InferenceResultState } from "./states";

export default function InferenceResultDisplayer() {
  const treatments = useRecoilValue(TreatmentsValue);
  const inferenceResult = useRecoilValue(InferenceResultState);
  const causalEffect = inferenceResult.causal_effect;

  return (
    <div className={styles.result}>
      {Object.keys(inferenceResult).length > 0 && (
        <table>
          <thead>
            <tr>
              <th className={styles.key}>Key</th>
              <th className={styles.value}>Causal Effect</th>
            </tr>
          </thead>
          <tbody>
            {causalEffect &&
              Object.entries(causalEffect).map(([key, value]) => {
                return (
                  <tr key={uuid4()}>
                    <td className={styles.key}>{key}</td>
                    <td className={styles.value}>{value.toFixed(4)}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      )}
    </div>
  );
}
