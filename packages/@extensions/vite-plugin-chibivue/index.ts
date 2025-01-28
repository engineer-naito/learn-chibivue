import type { Plugin } from "vite"
import { createFilter } from "vite"

export default function vitePluginChibivue(): Plugin {
  const filter = createFilter(/\.vue$/)

  return {
    name: "vite:chibivue",

    transform(code, id) {
      if (!filter(id)) return
      return { code: `export default {}` }
    },
  }
}
