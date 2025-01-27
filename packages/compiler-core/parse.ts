export const baseParse = (
  content: string,
): {
  tag: string
  props: Record<string, string>
  textContent: string
} => {
  const htmlTagPattern: RegExp= /<(\w+)\s+([^>]*)>([^<]*)<\/\1>/
  const matched = content.match(htmlTagPattern)
  if (!matched) return { tag: "", props: {}, textContent: "" }

  const [ _, tag, attrs, textContent ]  = matched

  const props: Record<string, string> = {}

  const htmlAttributePattern: RegExp = /(\w+)=["']([^"']*)["']/g;
  attrs.replace(htmlAttributePattern, (_, key: string, value: string) => {
    props[key] = value
    return ""
  })

  return { tag, props, textContent }
}
