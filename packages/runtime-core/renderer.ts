import { VNode } from "./vNode"

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
  vNode: string,
  container: HostElement,
) => void

export function createRenderer(options: RendererOptions) {
  const {
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    insert: hostInsert,
  } = options

  function renderVNode(vNode: VNode | string) {
    if (typeof vNode === "string") return hostCreateText(vNode)
      const el = hostCreateElement(vNode.type)

    Object.entries(vNode.props).forEach(([key, value]) => {
      hostPatchProp(el, key, value);
    });

    for (const child of vNode.children) {
      const childEl = renderVNode(child)
      hostInsert(childEl, el)
    }

    return el
  }

  const render: RootRenderFunction = (vNode, container) => {
    const el = renderVNode(vNode)
    hostInsert(el, container)
  }

  return { render }
}
