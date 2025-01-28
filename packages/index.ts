export * from "./runtime-core"
export * from "./runtime-dom"
export * from "./reactivity"

import { compile } from "./compiler-dom"
import type { InternalRenderFunction } from "./runtime-core"
import { registerRuntimeCompiler } from "./runtime-core"
import * as runtimeDOM from "./runtime-dom"

function compileToFunction(template: string): InternalRenderFunction {
  const code = compile(template)
  return new Function("ChibiVue", code)(runtimeDOM)
}

registerRuntimeCompiler(compileToFunction)
