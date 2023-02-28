import { v4 as uuid4 } from "uuid";
import { useRecoilValue } from "recoil";
import { InferenceResultState } from "./states";
import styles from "../../styles/components/Inference/Result.module.scss";

export default function InferenceResultDisplayer() {
  const inferenceResult = useRecoilValue(InferenceResultState);

  return (
    <div className={styles.result}>
      {Object.keys(inferenceResult).length > 0 && (
        <table>
          <thead>
            <tr>
              <th className={styles.key}>Key</th>
              <th className={styles.value}>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(inferenceResult).map(([key, value]) => {
              if (typeof value !== "number") return;
              return (
                <tr key={uuid4()}>
                  <td className={styles.key}>{key}</td>
                  <td className={styles.value}>{value.toFixed(3)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
