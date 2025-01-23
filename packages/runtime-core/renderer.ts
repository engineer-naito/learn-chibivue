import { ReactiveEffect } from "../reactivity"
import type { Component } from "./component"
import type { VNode } from "./vNode"
import { normalizeVNode, Text } from "./vNode"

export interface RendererOptions<
  HostNode = RendererNode,
  HostElement = RendererElement
> {
  patchProp(el: HostElement, key: string, value: any): void,

  createElement(type: string): HostNode

  createText(type: string): HostNode

  setElementText(node: HostNode, text: string): void

  insert(child: HostNode, parent: HostNode, anchor?: HostNode | null): void
}

export interface RendererNode {
  [key: string]: any
}

export interface RendererElement extends RendererNode {}

export type RootRenderFunction<HostElement = RendererElement> = (
  vNode: Component,
  container: HostElement,
) => void

export function createRenderer(options: RendererOptions) {
  const {
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    insert: hostInsert,
  } = options

  const patch = (n1: VNode | null, n2: VNode, container: RendererElement) => {
    const { type } = n2
    if (type === Text) {
      processText(n1, n2, container)
    } else {
      processElement(n1, n2, container)
    }
  }

  const processElement = (
    n1: VNode | null,
    n2: VNode,
    container: RendererElement,
  ) => {
    if (n1 === null) {
      mountElement(n2, container)
    } else {
      // patchElement(n1, n2)
    }
  }

  const mountElement = (vNode: VNode, container: RendererElement) => {
    let el: RendererElement
    const { type, props } = vNode
    el = vNode.el = hostCreateElement(type as string)

    mountChildren(vNode.children as VNode[], el)

    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, props[key])
      }
    }

    hostInsert(el, container)
  }

  const mountChildren = (children: VNode[], container: RendererElement) => {
    for (let i = 0; i < children.length; i++) {
      const child  = (children[i] = normalizeVNode(children[i]))
      patch(null, child, container)
    }
  }

  const processText = (
    n1: VNode | null,
    n2: VNode,
    container: RendererElement,
  ) => {
    if (n1 === null) {
      hostInsert((n2.el = hostCreateText(n2.children as string)), container)
    } else {
      // TODO: patch
    }
  }

  const render: RootRenderFunction = (rootComponent, container) => {
    const componentRender = rootComponent.setup!()
  
    let n1: VNode | null = null
  
    const updateComponent = () => {
      const n2 = componentRender()
      patch(n1, n2, container)
      n1 = n2
    }
  
    const effect = new ReactiveEffect(updateComponent)
    effect.run()
  }

  return { render }
}
