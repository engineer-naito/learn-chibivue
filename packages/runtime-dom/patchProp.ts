import type { RendererOptions } from "../runtime-core";

type DOMRenderOptions = RendererOptions

const onRE = /^on[^a-z]/;
export const isOn = (key: string) => onRE.test(key);

export const patchProp: DOMRenderOptions["patchProp"] = (el, key, value) => {
  if (isOn(key)) {
    // patchEvent
  } else {
    // patchAttr
  }
};
