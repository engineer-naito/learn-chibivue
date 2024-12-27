import type { CreateAppFunction } from "../runtime-core";
import { createRenderer, createAppAPI } from "../runtime-core";
import { nodeOps } from "./nodeOps";

const { render } = createRenderer(nodeOps);
const _createApp = createAppAPI(render);

export const createApp = ((...args) => {
  const app = _createApp(...args);
  const { mount } = app;
  app.mount = (selector: string) => {
    const contaiener = document.querySelector(selector);
    if (!contaiener) return;
    mount(contaiener);
  };

  return app;
}) as CreateAppFunction<Element>;
