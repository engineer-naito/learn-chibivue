import { VNode, VNodeProps, createVNode } from "./vNode"

export function h(
  type: string,
  props: VNodeProps,
  children: (VNode | string)[],
) {
  return createVNode(type, props, children)
}
