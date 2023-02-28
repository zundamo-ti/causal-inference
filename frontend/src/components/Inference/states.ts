import { atom, RecoilState } from "recoil";

export const InferenceResultState: RecoilState<InferenceResult> = atom({
  key: "InferenceResultState",
  default: {},
});
