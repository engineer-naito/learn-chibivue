import type { ReactiveEffect } from "../reactivity"
import { emit } from "./componentEmits"
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

  emit: (event: string, ...args: any[]) => void

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

    emit: null!,

    isMounted: false,
  }

  instance.emit = emit.bind(null, instance)
  return instance
}
