import type { ReactiveEffect } from "../reactivity"
import type { ComponentOptions } from "./componentOptions"
import type { Props } from "./componentProps"
import type { VNode, VNodeChild } from "./vNode"

export type Component = ComponentOptions

export type Data = Record<string, unknown>

export interface ComponentInternalInstance {
  type: Component
  vNode: VNode
  subTree: VNode
  next: VNode | null
  effect: ReactiveEffect
  render: InternalRenderFunction
  update: () => void

  propsOptions: Props
  props: Data

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

    propsOptions: type.props || {},
    props: {},

    isMounted: false,
  }

  return instance
}
