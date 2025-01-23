import { RendererNode } from "./renderer"

export const Text = Symbol()

export type VNodeTypes = string | typeof Text

export type VNode<HostNode = RendererNode> = {
  type: VNodeTypes
  props: VNodeProps | null
  children: VNodeNormalizedChildren
  el: HostNode | undefined
}

export interface VNodeProps {
  [key: string]: any
}

export type VNodeNormalizedChildren = string | VNodeArrayChildren
export type VNodeArrayChildren = (VNodeArrayChildren | VNodeChildAtom)[]

export type VNodeChild = VNodeChildAtom | VNodeArrayChildren
type VNodeChildAtom = VNode | string

export function createVNode(
  type: VNodeTypes,
  props: VNodeProps | null,
  children: VNodeNormalizedChildren,
): VNode {
  const vNode: VNode = { type, props, children, el: undefined }
  return vNode
}

export function normalizeVNode(child: VNodeChild): VNode {
  if (typeof child === "object") {
    return { ...child } as VNode
  }
  return createVNode(Text, null, String(child))
}
