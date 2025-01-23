import type { ReactiveEffect } from "../reactivity"
import type { ComponentOptions } from "./componentOptions"
import type { VNode, VNodeChild } from "./vNode"

export type Component = ComponentOptions

export interface ComponentInternalInstance {
  type: Component
  vNode: VNode
  subTree: VNode
  next: VNode
  effect: ReactiveEffect
  render: InternalRenderFunction
  update: () => void
  isMounted: boolean
}

export type InternalRenderFunction = {
  (): VNodeChild
}
