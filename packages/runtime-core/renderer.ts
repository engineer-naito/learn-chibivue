import { ReactiveEffect } from "../reactivity"
import type { Component, ComponentInternalInstance } from "./component"
import { createComponentInstance, setupComponent } from "./component"
import { updateProps } from "./componentProps"
import { createVNode, normalizeVNode, Text } from "./vNode"
import type { VNode } from "./vNode"

export interface RendererOptions<
  HostNode = RendererNode,
  HostElement = RendererElement
> {
  patchProp(el: HostElement, key: string, value: any): void,

  createElement(type: string): HostNode

  createText(text: string): HostNode

  setText(node: HostNode, text: string): void

  setElementText(node: HostNode, text: string): void

  insert(child: HostNode, parent: HostNode, anchor?: HostNode | null): void

  parentNode(node: HostNode): HostNode | null
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
    setText: hostSetText,
    insert: hostInsert,
    parentNode: hostParentNode,
  } = options

  const patch = (n1: VNode | null, n2: VNode, container: RendererElement) => {
    const { type } = n2
    if (type === Text) {
      processText(n1, n2, container)
    } else if (typeof type === "string") {
      processElement(n1, n2, container)
    } else if (typeof type === "object") {
      processComponent(n1, n2, container)
    } else {
      // do nothing
    }
  }

  const processComponent = (
    n1: VNode | null,
    n2: VNode,
    container: RendererElement,
  ) => {
    if (n1 === null) {
      mountComponent(n2, container)
    } else {
      updateComponent(n1, n2)
    }
  }

  const mountComponent = (initialVNode: VNode, container: RendererElement) => {
    const instance: ComponentInternalInstance = (initialVNode.component = createComponentInstance(initialVNode))

    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container)
  }

  const setupRenderEffect = (
    instance: ComponentInternalInstance,
    initialVNode: VNode,
    container: RendererElement,
  ) => {
    const componentUpdateFn = () => {
      const { render, setupState } = instance
      
      if (!instance.isMounted) {
        const subTree = (instance.subTree = normalizeVNode(render(setupState)))
        patch(null, subTree, container)
        initialVNode.el = subTree.el
        instance.isMounted = true
      } else {
        let { next, vNode } = instance

        if (next) {
          next.el = vNode.el
          next.component = instance
          instance.vNode = next
          instance.next = null
          updateProps(instance, next.props)
        } else {
          next = vNode
        }

        const prevTree = instance.subTree
        const nextTree = normalizeVNode(render(setupState))
        instance.subTree = nextTree

        patch(prevTree, nextTree, hostParentNode(prevTree.el!)!)
      }
    }

    const effect = (instance.effect = new ReactiveEffect(componentUpdateFn))
    const update = (instance.update = () => effect.run())
    update()
  }

  const processElement = (
    n1: VNode | null,
    n2: VNode,
    container: RendererElement,
  ) => {
    if (n1 === null) {
      mountElemtnt(n2, container)
    } else {
      patchElement(n1, n2)
    }
  }

  const mountElemtnt = (vNode: VNode, container: RendererElement) => {
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
      const child = (children[i] = normalizeVNode(children[i]))
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
      const el = (n2.el = n1.el!)
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children as string)
      }
    }
  }

  const patchElement = (n1: VNode, n2: VNode) => {
    const el = (n2.el = n1.el!)

    const props = n2.props

    patchChildren(n1, n2, el)

    for (const key in props) {
      if (props[key] !== n1.props?.[key]) {
        hostPatchProp(el, key, props[key])
      }
    }
  }

  const patchChildren = (n1: VNode, n2: VNode, container: RendererElement) => {
    const c1 = n1.children as VNode[]
    const c2 = n2.children as VNode[]

    for (let i = 0; i < c2.length; i++) {
      const child = (c2[i] = normalizeVNode(c2[i]))
      patch(c1[i], child, container)
    }
  }

  const updateComponent = (n1: VNode, n2: VNode) => {
    const instance = (n2.component = n1.component)!
    instance.next = n2
    instance.update()
  }

  const render: RootRenderFunction = (rootComponent, container) => {
    const vNode = createVNode(rootComponent, {}, [])
    patch(null, vNode, container)
  }

  return { render }
}
