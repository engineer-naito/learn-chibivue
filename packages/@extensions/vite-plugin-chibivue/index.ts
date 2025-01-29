import type { Plugin } from "vite"
import { createFilter } from "vite"
import { parse, rewriteDefault } from "../../compiler-sfc"
import { compile } from "../../compiler-dom"

export default function vitePluginChibivue(): Plugin {
  const filter = createFilter(/\.vue$/)

  return {
    name: "vite:chibivue",

    transform(code, id) {
      if (!filter(id)) return

      const outputs = []

      outputs.push("import * as Chibivue from 'chibivue'")

      const { descriptor } = parse(code, { filename: id })

      const SFC_MAIN = "sfc_main"
      const scriptCode = rewriteDefault(
        descriptor.script?.content ?? "",
        SFC_MAIN
      )
      outputs.push(scriptCode)

      const templateCode = compile(descriptor.template?.content ?? "", {
        isBrowser: false,
      })
      outputs.push(templateCode)
      outputs.push("\n")
      outputs.push(`export default { ...${SFC_MAIN}, render }`) 

      return { code: outputs.join("\n") }
    },
  }
}
