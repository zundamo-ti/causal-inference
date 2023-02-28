import { useState } from "react";
import { useRecoilState } from "recoil";
import { TableState } from "./states";
import styles from "../../styles/components/Graph/Upload.module.scss";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [table, setTable] = useRecoilState(TableState);

  const fileReader = new FileReader();
  fileReader.addEventListener("load", (event) => {
    const csvString = event.target?.result?.toString().trim();
    if (!csvString) {
      return;
    }
    const csvRows = csvString.split("\n").map((rowString) => {
      return rowString.split(",");
    });
    const header = csvRows[0];
    const csvValues: Table = {};
    header.forEach((headName) => {
      if (!headName) return;
      csvValues[headName] = [];
    });
    csvRows.slice(1).map((row) => {
      row.map((value, index) => {
        const headName = header[index];
        if (!headName) return;
        csvValues[headName].push(Number(value));
      });
    });
    setTable(csvValues);
  });

  return (
    <div className={styles.upload}>
      <h1>Upload File</h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (file) {
            fileReader.readAsText(file);
          }
        }}
      >
        <input
          type="file"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files[0]) setFile(files[0]);
          }}
        />
        <input type="submit" value="Upload" />
      </form>
    </div>
  );
}
