import { createApp, h } from "chibivue";

const app = createApp({
  setup() {
    // TODO: define state
    // const state = reactive({ count: 0 });

    return function render() {
      return h("div", { id: "my-app" }, [
        h("p", { style: "color: red; font-weight: bold;" }, ["Hello World!"]),
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
    }
  },
});

app.mount("#app");
