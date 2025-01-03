import type { RendererOptions } from "../runtime-core";
import { patchEvent } from "./modules/events";

type DOMRenderOptions = RendererOptions<Node, Element>;

const onRE = /^on[^a-z]/;
export const isOn = (key: string) => onRE.test(key);

export const patchProp: DOMRenderOptions["patchProp"] = (el, key, value) => {
  if (isOn(key)) {
    patchEvent(el, key, value);
  } else {
    // patchAttr
  }
};
