import { VNode } from "./vnode";

export interface RendererOptions<HostNode = RendererNode> {
  createElement(type: string): HostNode;

  createText(text: string): HostNode;

  setElementText(node: HostNode, text: string): void;

  insert(child: HostNode, parent: HostNode, anchor?: HostNode | null) :void;
}

export interface RendererNode {
  [key: string]: any;
}

export interface RendererElement extends RendererNode {}

export type RootRenderFunction<HostElement = RendererElement> = (
  message: string,
  containter: HostElement,
) => void;

export function createRenderer(options: RendererOptions) {
  const {
    setElementText: hostSetElementText,
    createElement: hostCreateElement,
    createText: hostCreateText,
    insert: hostInsert,
  } = options;

  function renderVNode(vNode: VNode | string) {
    if (typeof vNode === "string") return hostCreateText(vNode);
    const el = hostCreateElement(vNode.type);

    for (const child of vNode.children) {
      const childEl = renderVNode(child);
      hostInsert(childEl, el);
    }

    return el;
  }

  const render: RootRenderFunction = (vNode, container) => {
    hostSetElementText(container, vNode);
  }

  return { render };
}
