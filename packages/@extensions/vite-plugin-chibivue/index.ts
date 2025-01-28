import type { Plugin } from "vite"
import { createFilter } from "vite"
import { parse } from "../../compiler-sfc"

export default function vitePluginChibivue(): Plugin {
  const filter = createFilter(/\.vue$/)

  return {
    name: "vite:chibivue",

    transform(code, id) {
      if (!filter(id)) return

      const { descriptor } = parse(code, { filename: id })
      console.log(
        "🚀 ~ file: index.ts:15 ~ transform ~ description:",
        descriptor,
      )
      return { code: `export default {}` }
    },
  }
}
