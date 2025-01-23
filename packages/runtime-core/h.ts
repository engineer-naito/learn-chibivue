import type { VNode, VNodeProps } from "./vNode"
import { createVNode } from "./vNode"

export function h(
  type: string,
  props: VNodeProps,
  children: (VNode | string)[],
) {
  return createVNode(type, props, children)
}
