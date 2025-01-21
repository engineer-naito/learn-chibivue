import type { VNode, VNodeProps } from "./vNode"

export function h(
  type: string,
  props: VNodeProps,
  children: (VNode | string)[],
) {
  return { type, props, children }
}
