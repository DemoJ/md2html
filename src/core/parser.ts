/**
 * md2html - 公众号排版工具
 * Copyright (C) 2026 diyun <diyun@diyun.site>
 * Licensed under AGPL-3.0-or-later. See LICENSE for full text.
 * Based on gzh-design-skill by 甲木 × 摸鱼小李
 * https://github.com/isjiamu/gzh-design-skill
 */

import MarkdownIt from 'markdown-it'
import type { BlockNode, InlineNode, MarkdownDoc } from './types'

type Token = ReturnType<MarkdownIt['parse']>[number]

/**
 * 自定义 markdown-it 实例
 * - 支持 ==高亮== 语法
 * - 支持 ++下划线++ 和 <u>下划线</u> 语法
 * - 支持 GFM 表格
 */
function createMD(): MarkdownIt {
  const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: false,
    breaks: false,
  })

  // ==高亮== → highlight inline rule
  md.inline.ruler.before('emphasis', 'highlight', (state, silent) => {
    const src = state.src.slice(state.pos)
    const m = src.match(/^==([\s\S]+?)==/)
    if (!m) return false
    if (silent) return true
    const token = state.push('highlight_open', 'mark', 1)
    token.markup = '=='
    const textToken = state.push('text', '', 0)
    textToken.content = m[1]
    const closeToken = state.push('highlight_close', 'mark', -1)
    closeToken.markup = '=='
    state.pos += m[0].length
    return true
  })

  // ++下划线++ → underline inline rule
  md.inline.ruler.before('emphasis', 'underline', (state, silent) => {
    const src = state.src.slice(state.pos)
    const m = src.match(/^\+\+([\s\S]+?)\+\+/)
    if (!m) return false
    if (silent) return true
    const token = state.push('underline_open', 'u', 1)
    token.markup = '++'
    const textToken = state.push('text', '', 0)
    textToken.content = m[1]
    const closeToken = state.push('underline_close', 'u', -1)
    closeToken.markup = '++'
    state.pos += m[0].length
    return true
  })

  // 启用表格
  md.enable('table')

  return md
}

const md = createMD()

/** 将 markdown-it token 流转为自定义 AST */
function tokensToAST(tokens: Token[]): BlockNode[] {
  const blocks: BlockNode[] = []
  let i = 0

  while (i < tokens.length) {
    const token = tokens[i]

    // 跳过无内容 token
    if (token.type === 'inline' || token.type === 'text') {
      i++
      continue
    }

    // heading
    if (token.type === 'heading_open') {
      const level = parseInt(token.tag.slice(1))
      const inlineToken = tokens[i + 1]
      const children = inlineToken?.children ? parseInlineTokens(inlineToken.children) : []
      blocks.push({ type: 'heading', level, children })
      i += 3 // heading_open, inline, heading_close
      continue
    }

    // paragraph
    if (token.type === 'paragraph_open') {
      const inlineToken = tokens[i + 1]
      const children = inlineToken?.children ? parseInlineTokens(inlineToken.children) : []
      // 检查是否是纯图片段落
      if (children.length === 1 && children[0].type === 'image') {
        const img = children[0] as Extract<InlineNode, { type: 'image' }>
        blocks.push({ type: 'image', src: img.src, alt: img.alt })
      } else {
        blocks.push({ type: 'paragraph', children })
      }
      i += 3
      continue
    }

    // code_block / fence
    if (token.type === 'code_block' || token.type === 'fence') {
      const lang = token.info?.trim() || ''
      blocks.push({ type: 'code_block', lang, content: token.content })
      i++
      continue
    }

    // blockquote
    if (token.type === 'blockquote_open') {
      const innerTokens: Token[] = []
      let depth = 1
      i++
      while (i < tokens.length && depth > 0) {
        if (tokens[i].type === 'blockquote_open') depth++
        if (tokens[i].type === 'blockquote_close') depth--
        if (depth > 0) innerTokens.push(tokens[i])
        i++
      }
      blocks.push({ type: 'blockquote', children: tokensToAST(innerTokens) })
      continue
    }

    // ordered / bullet list
    if (token.type === 'ordered_list_open' || token.type === 'bullet_list_open') {
      const ordered = token.type === 'ordered_list_open'
      const items: BlockNode[][] = []
      i++
      while (i < tokens.length) {
        if (tokens[i].type === 'list_item_open') {
          const innerTokens: Token[] = []
          i++
          let itemDepth = 1
          while (i < tokens.length && itemDepth > 0) {
            if (tokens[i].type === 'list_item_open') itemDepth++
            if (tokens[i].type === 'list_item_close') itemDepth--
            if (itemDepth > 0) innerTokens.push(tokens[i])
            i++
          }
          items.push(tokensToAST(innerTokens))
        } else if (
          tokens[i].type === 'ordered_list_close' ||
          tokens[i].type === 'bullet_list_close'
        ) {
          i++
          break
        } else {
          i++
        }
      }
      blocks.push({ type: 'list', ordered, items })
      continue
    }

    // hr
    if (token.type === 'hr') {
      blocks.push({ type: 'hr' })
      i++
      continue
    }

    // table
    if (token.type === 'table_open') {
      const headers: InlineNode[][] = []
      const rows: InlineNode[][][] = []
      i++
      let inHeader = false
      let currentRow: InlineNode[][] = []

      while (i < tokens.length && tokens[i].type !== 'table_close') {
        if (tokens[i].type === 'thead_open') inHeader = true
        else if (tokens[i].type === 'thead_close') inHeader = false
        else if (tokens[i].type === 'tr_open') currentRow = []
        else if (tokens[i].type === 'tr_close') {
          if (inHeader) headers.push(...currentRow)
          else rows.push(currentRow)
        } else if (tokens[i].type === 'inline' && tokens[i].children) {
          currentRow.push(parseInlineTokens(tokens[i].children!))
        }
        i++
      }
      i++ // skip table_close
      blocks.push({ type: 'table', headers, rows })
      continue
    }

    // html_block — 跳过
    if (token.type === 'html_block') {
      i++
      continue
    }

    i++
  }

  return blocks
}

/** 解析 inline tokens 为 InlineNode 数组 */
function parseInlineTokens(tokens: Token[]): InlineNode[] {
  const result: InlineNode[] = []
  let i = 0

  while (i < tokens.length) {
    const token = tokens[i]

    if (token.type === 'text') {
      result.push({ type: 'text', content: token.content })
      i++
      continue
    }

    if (token.type === 'code_inline') {
      result.push({ type: 'code', content: token.content })
      i++
      continue
    }

    if (token.type === 'image') {
      const src = token.attrGet('src') || ''
      const alt = token.content || ''
      result.push({ type: 'image', src, alt })
      i++
      continue
    }

    // strong (bold)
    if (token.type === 'strong_open') {
      const { nodes, nextIndex } = collectInlineUntil(tokens, i + 1, 'strong_close')
      result.push({ type: 'strong', children: nodes })
      i = nextIndex
      continue
    }

    // em (italic)
    if (token.type === 'em_open') {
      const { nodes, nextIndex } = collectInlineUntil(tokens, i + 1, 'em_close')
      result.push({ type: 'em', children: nodes })
      i = nextIndex
      continue
    }

    // highlight
    if (token.type === 'highlight_open') {
      const { nodes, nextIndex } = collectInlineUntil(tokens, i + 1, 'highlight_close')
      result.push({ type: 'highlight', children: nodes })
      i = nextIndex
      continue
    }

    // underline
    if (token.type === 'underline_open') {
      const { nodes, nextIndex } = collectInlineUntil(tokens, i + 1, 'underline_close')
      result.push({ type: 'underline', children: nodes })
      i = nextIndex
      continue
    }

    // del (strikethrough)
    if (token.type === 's_open' || token.type === 'del_open') {
      const closeType = token.type === 's_open' ? 's_close' : 'del_close'
      const { nodes, nextIndex } = collectInlineUntil(tokens, i + 1, closeType)
      result.push({ type: 'del', children: nodes })
      i = nextIndex
      continue
    }

    // link
    if (token.type === 'link_open') {
      const href = token.attrGet('href') || ''
      const { nodes, nextIndex } = collectInlineUntil(tokens, i + 1, 'link_close')
      result.push({ type: 'link', href, children: nodes })
      i = nextIndex
      continue
    }

    i++
  }

  return result
}

/** 收集 inline tokens 直到遇到指定的 close 类型 */
function collectInlineUntil(
  tokens: Token[],
  start: number,
  closeType: string
): { nodes: InlineNode[]; nextIndex: number } {
  const innerTokens: Token[] = []
  let i = start
  while (i < tokens.length && tokens[i].type !== closeType) {
    innerTokens.push(tokens[i])
    i++
  }
  i++ // skip close token
  return { nodes: parseInlineTokens(innerTokens), nextIndex: i }
}

/**
 * 从 AST 中提取文章标题
 * 参考原 skill format-normalize.md 的规则：
 * 只有文首的一级标题（#）才作为文章标题，
 * 即它是 blocks 中的第一个 block（或前面只有可跳过的内容）
 * 如果 # 出现在文章中间，它只是一个普通标题，不当作文章标题
 */
function extractTitle(blocks: BlockNode[]): { title: string; titleBlockIdx: number } {
  // 文首第一个 block 就是一级标题 → 它是文章标题
  if (blocks.length > 0 && blocks[0].type === 'heading' && blocks[0].level === 1) {
    return {
      title: inlineToPlainText(blocks[0].children),
      titleBlockIdx: 0,
    }
  }
  return { title: '', titleBlockIdx: -1 }
}

/** InlineNode 数组转纯文本 */
export function inlineToPlainText(nodes: InlineNode[]): string {
  return nodes
    .map((n) => {
      switch (n.type) {
        case 'text':
          return n.content
        case 'code':
          return n.content
        case 'image':
          return n.alt
        case 'link':
          return inlineToPlainText(n.children)
        default:
          return inlineToPlainText(n.children)
      }
    })
    .join('')
}

/** 主解析函数 */
export function parseMarkdown(content: string): MarkdownDoc {
  const tokens = md.parse(content, {})
  const blocks = tokensToAST(tokens)
  const { title, titleBlockIdx } = extractTitle(blocks)
  return { title, titleBlockIdx, blocks }
}

/**
 * 获取所有章节标题
 * 参考原 skill：章节标题是 ##（二级标题）
 * 但如果文章没有 # 一级标题，且用了 # 作为章节标题，
 * 则 # 也应被当作章节标题（由 generator 决定是否跳过文首标题）
 */
export function getChapters(doc: MarkdownDoc): { index: number; title: string }[] {
  const chapters: { index: number; title: string }[] = []
  doc.blocks.forEach((block, i) => {
    // 跳过被识别为文章标题的 block
    if (i === doc.titleBlockIdx) return
    if (block.type === 'heading' && (block.level === 1 || block.level === 2)) {
      chapters.push({ index: i, title: inlineToPlainText(block.children) })
    }
  })
  return chapters
}
