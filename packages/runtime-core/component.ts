import type { ReactiveEffect } from "../reactivity"
import type { ComponentOptions } from "./componentOptions"
import type { VNode, VNodeChild } from "./vNode"

export type Component = ComponentOptions

export interface ComponentInternalInstance {
  type: Component
  vNode: VNode
  subTree: VNode
  next: VNode | null
  effect: ReactiveEffect
  render: InternalRenderFunction
  update: () => void
  isMounted: boolean
}

export type InternalRenderFunction = {
  (): VNodeChild
}

export function createComponentInstance(vNode: VNode): ComponentInternalInstance {
  const type = vNode.type as Component

  const instance: ComponentInternalInstance = {
    type,
    vNode,
    next: null,
    effect: null!,
    subTree: null!,
    update: null!,
    render: null!,
    isMounted: false,
  }

  return instance
}
