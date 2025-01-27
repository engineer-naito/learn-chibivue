import type {
  AttributeNode,
  ElementNode,
  Position,
  SourceLocation,
  TemplateChildNode,
  TextNode
} from "./ast"
import { NodeTypes } from "./ast" 

export interface ParserContext {
  readonly originalSource: string

  source: string

  offset: number
  line: number
  column: number
}

function createParserContext(content: string): ParserContext {
  return {
    originalSource: content,
    source: content,
    column:1,
    line: 1,
    offset: 0,
  }
}

export const baseParse = (
  content: string,
): { children: TemplateChildNode[] } => {
  const context = createParserContext(content)
  const children = parseChildren(context, [])

  return { children }
}

function parseChildren(
  context: ParserContext,

  // HTML は再起的な構造を持っている
  // 祖先要素をスタックとして持っておいて、子にネストして行くたびに push
  // end タグを見つけると parseChildren が終了して ancestors を pop 
  ancestors: ElementNode[],
): TemplateChildNode[] {
  const nodes: TemplateChildNode[] = []

  while (!isEnd(context, ancestors)) {
    const s = context.source
    let node: TemplateChildNode | undefined = undefined

    if (s[0] === "<") {
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors)
      }
    }

    if (!node) {
      node = parseText(context)
    }

    pushNode(nodes, node)
  }

  return nodes
}

function isEnd(context: ParserContext, ancestors: ElementNode[]): boolean {
  const s = context.source

  if (starsWith(s, "</")) {
    for (let i = ancestors.length - 1; i >= 0; --i) {
      if (startsWithEndTagOpen(s, ancestors[i].tag)) return true
    }
  }

  return !s
}

function starsWith(source: string, searchString: string): boolean {
  return source.startsWith(searchString)
}

function pushNode(nodes: TemplateChildNode[], node: TemplateChildNode): void {
  if (node.type === NodeTypes.TEXT) {
    const prev = last(nodes)
    if (prev && prev.type === NodeTypes.TEXT) {
      prev.content += node.content
      return
    }
  }

  nodes.push(node)
}

function last<T>(xs: T[]): T | undefined {
  return xs[xs.length - 1]
}

function startsWithEndTagOpen(source: string, tag: string): boolean {
  const tagDelimiterPattern: RegExp = /[\t\r\n\f />]/
  return (
    starsWith(source, "</") &&
    source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase() &&
    tagDelimiterPattern.test(source[2 + tag.length] || ">")
  )
}

function parseText(context: ParserContext): TextNode {
  const endToken = "<"
  let endIndex = context.source.length
  const index = context.source.indexOf(endToken, 1)
  if (index !== -1 && endIndex > index) {
    endIndex = index
  }

  const start = getCursor(context)

  const content = parseTextData(context, endIndex)

  return {
    type: NodeTypes.TEXT,
    content,
    loc: getSelection(context, start),
  }
}

function parseTextData(context: ParserContext, length: number): string {
  const rawText = context.source.slice(0, length)
  advanceBy(context, length)
  return rawText
}

function advanceBy(context: ParserContext, numberOfCharacters: number): void {
  const { source } = context
  advancePositionWithMutation(context, source, numberOfCharacters)
  context.source = source.slice(numberOfCharacters)
}

function advanceSpaces(context: ParserContext): void {
  const leadingWhitespacePattern: RegExp = /^[\t\r\n\f ]+/
  const match = leadingWhitespacePattern.exec(context.source)
  if (match) {
    advanceBy(context, match[0].length)
  }
}

function advancePositionWithMutation(
  pos: Position,
  source: string,
  numberOfCharacters: number = source.length,
): Position {
  let linesCount = 0
  let lastNewLinePos = -1
  const CHAR_CODE_OF_NEWLINE = 10
  for (let i = 0; i < numberOfCharacters; i++) {
    if (source.charCodeAt(i) === CHAR_CODE_OF_NEWLINE) {
      linesCount++
      lastNewLinePos = i
    }
  }

  pos.offset += numberOfCharacters
  pos.line += linesCount
  pos.column =
    lastNewLinePos === -1
      ? pos.column + numberOfCharacters
      : numberOfCharacters - lastNewLinePos

  return pos
}

function getCursor(context: ParserContext): Position {
  const { column, line, offset } = context
  return { column, line, offset }
}

function getSelection(
  context: ParserContext,
  start: Position,
  end?: Position,
): SourceLocation {
  end = end || getCursor(context)
  return {
    start,
    end,
    source: context.originalSource.slice(start.offset, end.offset)
  }
}

const enum TagType {
  Start,
  End,
}

function parseElement(
  context: ParserContext,
  ancestors: ElementNode[],
): ElementNode | undefined {
  const element = parseTag(context, TagType.Start)

  if (element.isSelfClosing) return element

  ancestors.push(element)
  const children = parseChildren(context, ancestors)
  ancestors.pop()

  element.children = children

  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End)
  }

  return element
}

function parseTag(context: ParserContext, type: TagType): ElementNode {
  const start = getCursor(context)
  const htmlTagNamePattern: RegExp = /^<\/?([a-z][^\t\r\n\f />]*)/i
  const match = htmlTagNamePattern.exec(context.source)!
  const tag = match[1]

  advanceBy(context, match[0].length)
  advanceSpaces(context)

  let props = parseAttributes(context, type)

  let isSelfClosing = false

  isSelfClosing = starsWith(context.source, "/>")
  advanceBy(context, isSelfClosing ? 2 : 1)

  return {
    type: NodeTypes.ELEMENT,
    tag,
    props,
    children: [],
    isSelfClosing,
    loc: getSelection(context, start),
  }
}

function parseAttributes(
  context: ParserContext,
  type: TagType,
): AttributeNode[] {
  const props = []
  const attributeNames = new Set<string>()

  while (
    context.source.length > 0 &&
    !starsWith(context.source, ">") &&
    !starsWith(context.source, "/>")
  ) {
    const attr = parseAttribute(context, attributeNames)

    if (type === TagType.Start) props.push(attr)

    advanceSpaces(context)
  }

  return props
}

type AttributeValue =
  | {
    content: string
    loc: SourceLocation
  }
  | undefined

function parseAttribute(
  context: ParserContext,
  nameSet: Set<string>,
): AttributeNode {
  const start = getCursor(context)
  const htmlAttributeNamePattern: RegExp = /^[^\t\r\n\f />][^\t\r\n\f />=]*/
  const match = htmlAttributeNamePattern.exec(context.source)!
  const name = match[0]

  nameSet.add(name)

  advanceBy(context, name.length)

  let value: AttributeValue = undefined

  const whitespaceEqualsPattern: RegExp = /^[\t\r\n\f ]*=/
  if (whitespaceEqualsPattern.test(context.source)) {
    advanceSpaces(context)
    advanceBy(context, 1)
    advanceSpaces(context)
    value = parseAttributeValue(context)
  }

  const loc = getSelection(context, start)

  return {
    type: NodeTypes.ATTRIBUTE,
    name,
    value: value && {
      type: NodeTypes.TEXT,
      content: value.content,
      loc: value.loc,
    },
    loc,
  }
}

function parseAttributeValue(context: ParserContext): AttributeValue {
  const start = getCursor(context)
  let content: string
  
  const quote = context.source[0]
  const isQuoted = [`"`, `'`].includes(quote)
  if (isQuoted) {
    advanceBy(context, 1)

    const endIndex = context.source.indexOf(quote)
    if (endIndex === -1) {
      content = parseTextData(context, context.source.length)
    } else {
      content = parseTextData(context, endIndex)
      advanceBy(context, 1)
    }
  } else {
    const tagOrAttributeNamePattern: RegExp = /^[^\t\r\n\f >]+/
    const match = tagOrAttributeNamePattern.exec(context.source)
    if (!match) return undefined

    content = parseTextData(context, match[0].length)
  }

  return { content, loc: getSelection(context, start) }
} 
