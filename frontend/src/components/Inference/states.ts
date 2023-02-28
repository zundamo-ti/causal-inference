import { atom, RecoilState } from "recoil";

export const InferenceResultState: RecoilState<InferenceResult> = atom({
  key: "InferenceResultState",
  default: {},
});

export const InferenceModeState: RecoilState<{ mode?: InferenceMode }> = atom({
  key: "InferenceModeState",
  default: {},
});
