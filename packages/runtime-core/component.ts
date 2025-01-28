import type { ReactiveEffect } from "../reactivity"
import { emit } from "./componentEmits"
import type { ComponentOptions } from "./componentOptions"
import type { Props } from "./componentProps"
import { initProps } from "./componentProps"
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

  setupState: Data

  isMounted: boolean
}

export type InternalRenderFunction = {
  (ctx: Data): VNodeChild
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

    setupState: {},

    isMounted: false,
  }

  instance.emit = emit.bind(null, instance)
  return instance
}

type CompileFunction = (template: string) => InternalRenderFunction
let compile: CompileFunction | undefined

export function registerRuntimeCompiler(_compile: any) {
  compile = _compile
}

export const setupComponent = (instance: ComponentInternalInstance) => {
  const { props } = instance.vNode
  initProps(instance, props)

  const component = instance.type as Component
  if (component.setup) {
    const setupResult = component.setup(instance.props, {
      emit: instance.emit,
    }) as InternalRenderFunction

    if (typeof setupResult === "function") {
      instance.render = setupResult
    } else if (typeof setupResult === "object" && setupResult !== null) {
      instance.setupState = setupResult
    } else {
      // do nothing
    }
  }

  if (compile && !component.render) {
    const template = component.template ?? ""
    if (template) {
      instance.render = compile(template)
    }
  }
}
