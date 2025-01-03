import { createApp, h } from "chibivue";

const app = createApp({
  render() {
    return h("div", {}, [
      h("p", {}, ["Hello World!"]),
      h(
        "button",
        {
          onClick() {
            alert("Hello World!");
          },
        },
        ["Click me!"],
      ),
    ]);
  },
});

app.mount("#app");
