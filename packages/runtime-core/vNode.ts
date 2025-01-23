export const Text = Symbol()

export type VNodeTypes = string | typeof Text

export interface VNode<HostNode = any> {
  type: VNodeTypes
  props: VNodeProps | null,
  children: VNodeNormalizedChildren
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
  const vNode: VNode = { type, props, children }
  return vNode
}

// h 関数を実行した時は従来通りの表現
// Text を表現するのは render 関数内で
export function normalizeVNode(child: VNodeChild): VNode {
  if (typeof child === "object") {
    return { ...child } as VNode
  }
  return createVNode(Text, null, String(child))
}
