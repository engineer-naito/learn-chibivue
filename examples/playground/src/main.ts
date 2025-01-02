import { createApp, h } from "chibivue";

const app = createApp({
  render() {
    return h("div", {}, ["Hello World!"]);
  },
});

app.mount("#app");
