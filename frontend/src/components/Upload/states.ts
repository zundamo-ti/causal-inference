import { atom, RecoilState } from "recoil";

export const TableState: RecoilState<Table> = atom({
  key: "TableState",
  default: {},
});
