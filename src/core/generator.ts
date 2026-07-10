/**
 * md2html - 公众号排版工具
 * Copyright (C) 2026 diyun <diyun@diyun.site>
 * Licensed under AGPL-3.0-or-later. See LICENSE for full text.
 * Based on gzh-design-skill by 甲木 × 摸鱼小李
 * https://github.com/isjiamu/gzh-design-skill
 */

import type {
  AIEnhanceResult,
  BlockNode,
  InlineNode,
  MarkdownDoc,
  ThemeConfig,
  CoverData,
  IntroData,
  TocItem,
} from './types'
import { inlineToPlainText, getChapters } from './parser'
import {
  toFullWidthPunctuation,
  wrapLeaf,
  escapeHtml,
  formatChapterNumber,
  isConclusionChapter,
  generateEnLabel,
  applyKeywordUnderline,
  formatDateLabel,
} from './transform'

export interface GenerateOptions {
  theme: ThemeConfig
  enhance?: AIEnhanceResult | null
  authorName?: string
  authorBio?: string
  showCover?: boolean
  showToc?: boolean
}

/**
 * HTML 生成器主函数
 * 将 Markdown AST + 主题 + AI增强结果 → 公众号 HTML
 */
export function generateHtml(doc: MarkdownDoc, options: GenerateOptions): string {
  const { theme, enhance, authorName, authorBio } = options
  const comps = theme.components

  // 提取章节（getChapters 已跳过文首标题 block）
  const chapters = getChapters(doc)
  const titleBlockIdx = doc.titleBlockIdx ?? -1

  // 收集各部分 HTML
  const parts: string[] = []

  // 查找开头引言块（文章最开头的 > 引用块）
  // 参考原 skill：开头引言是紧跟在文章标题之后的第一个 blockquote
  // 如果在遇到 blockquote 之前有正文段落/章节标题等，则认为没有开头引言
  let openingQuoteText: string | null = null
  let openingQuoteBlockIdx = -1
  for (let i = 0; i < doc.blocks.length; i++) {
    const block = doc.blocks[i]
    // 跳过文首标题（文章标题）
    if (i === titleBlockIdx) continue
    if (block.type === 'blockquote') {
      const text = block.children
        .map((c) => (c.type === 'paragraph' ? inlineToPlainText(c.children) : ''))
        .join('')
        .trim()
      if (text) {
        openingQuoteText = text
        openingQuoteBlockIdx = i
      }
      break
    }
    // 遇到其他内容说明开头没有引言块
    break
  }

  // === 封面 ===
  if (options.showCover !== false) {
    if (enhance?.coverText) {
      parts.push(comps.cover(enhance.coverText))
    } else if (doc.title) {
      parts.push(generateSimpleCover(doc, theme))
    }
  }

  // === 目录（toc-scroll：列出所有章节 + 固定「写在最后」卡） ===
  // 参考原 skill 骨架顺序：目录必须紧跟封面之下，在开头引言和前言正文之前
  // skill 要求：2+ 章节时生成，横向滚动列出【所有】章节（非「精选前 3」），
  // 最后一个固定为「写在最后（PART {marker}）」卡；仍受当前网站 showToc 设置控制是否显示
  // 仅当最后一章本身就是结语章时，才用「写在最后」卡代表它，避免与正文结语重复
  if (options.showToc !== false && chapters.length >= 2) {
    const tocItems: TocItem[] = chapters.map((ch) => ({ title: ch.title }))
    if (tocItems.length > 0 && isConclusionChapter(chapters[chapters.length - 1].title)) {
      tocItems.pop()
    }
    if (tocItems.length > 0) {
      parts.push(comps.toc(tocItems, theme.conclusionMarker ?? '∞'))
    }
  }

    // === 引言卡 ===
    // 引言由文章开头的 blockquote 决定，有就显示，没有就没有
    // 参考原 skill 骨架顺序：引言在目录之后、正文之前
    if (openingQuoteText) {
      const introKeywords = enhance?.introCard?.keywords
      const hasKeywords = !!introKeywords?.length
      const introData: IntroData = {
        text: openingQuoteText,
        author: enhance?.introCard?.author,
        // 无 AI 关键词时，把整句作为亮点高亮（贴近 skill oneliner-card）
        highlightAll: !hasKeywords,
      }
      let introHtml = comps.introCard(introData)
      // 引言关键词高亮（有 AI 关键词时优先精确高亮）
      if (hasKeywords) {
        const highlightCSS = `background:linear-gradient(transparent 60%,${theme.designVars.highlight} 60%);font-weight:600;`
        introHtml = applyKeywordUnderline(introHtml, introKeywords!, highlightCSS)
      }
      parts.push(introHtml)
    }

  // === 正文 ===
  let chapterIndex = -1
  let paragraphIndex = 0
  let hasFirstChapter = false

  for (let blockIdx = 0; blockIdx < doc.blocks.length; blockIdx++) {
    const block = doc.blocks[blockIdx]

    // 跳过文首标题（已用于封面）
    if (blockIdx === titleBlockIdx) continue

    // 跳过已用作引言卡的开头 blockquote
    if (blockIdx === openingQuoteBlockIdx) continue

    // 一级或二级标题 → 章节标题
    // 参考原 skill：## 是章节标题；如果文章没有 # 文首标题，
    // 用了 # 作为章节标题也应被当作章节标题渲染
    if (block.type === 'heading' && (block.level === 1 || block.level === 2)) {
      chapterIndex++
      hasFirstChapter = true
      const title = inlineToPlainText(block.children)
      const isConclusion = isConclusionChapter(title)
      // 结语章编号：优先用主题库指定的变体（如摸鱼绿 '///'），否则沿用数字编号/∞
      const num =
        isConclusion && theme.conclusionMarker
          ? theme.conclusionMarker
          : formatChapterNumber(chapterIndex, chapters.length, isConclusion)
      const enLabel =
        enhance?.chapterLabels?.[chapterIndex] || generateEnLabel(title)
      parts.push(comps.chapterTitle({ num, enLabel, title }))
      continue
    }

    // 三级标题 → 左竖条小标题
    if (block.type === 'heading' && block.level >= 3) {
      const title = inlineToPlainText(block.children)
      parts.push(comps.leftBarTitle(title))
      continue
    }

    // 段落
    if (block.type === 'paragraph') {
      const text = inlineToPlainText(block.children)
      // 待补素材检测：【插入xxx】、【待补xxx】、【配图xxx】等
      const placeholderMatch = text.match(/^【(.+?)】$/)
      if (placeholderMatch) {
        parts.push(comps.placeholder(text))
        continue
      }
      // 正常段落
      let html = renderInline(block.children, theme)
      // 应用关键词下划线
      const keywords = enhance?.keywords?.[paragraphIndex]
      if (keywords && keywords.length > 0) {
        html = applyKeywordUnderline(html, keywords, theme.underlineCSS)
      }
      parts.push(comps.bodyParagraph(html))
      paragraphIndex++
      continue
    }

    // 引用块（非开头引言的引用块渲染为引用高亮块）
    if (block.type === 'blockquote') {
      const quoteText = block.children
        .map((c) => (c.type === 'paragraph' ? renderInline((c as any).children, theme) : ''))
        .join('')
      parts.push(comps.quoteBlock(quoteText))
      continue
    }

    // 代码块（按主题切换深色/浅色，参考 skill 1a/1b）
    if (block.type === 'code_block') {
      const lines = block.content.split('\n').filter((l) => l.length > 0 || true)
      const codeStyle = theme.codeStyle || 'dark'
      parts.push(
        codeStyle === 'light'
          ? comps.codeBlockLight(block.lang, lines)
          : comps.codeBlockDark(block.lang, lines)
      )
      continue
    }

    // 图片
    if (block.type === 'image') {
      const isGif = block.src.toLowerCase().endsWith('.gif')
      if (isGif) {
        parts.push(comps.gifImage(block.src, block.alt))
      } else {
        parts.push(comps.image(block.src, block.alt))
      }
      continue
    }

    // 分割线
    if (block.type === 'hr') {
      parts.push(comps.hr())
      continue
    }

    // 列表
    if (block.type === 'list') {
      block.items.forEach((itemBlocks, idx) => {
        const itemHtml = itemBlocks
          .map((b) => {
            if (b.type === 'paragraph') {
              return renderInline(b.children, theme)
            }
            return ''
          })
          .join('')
        parts.push(comps.listItem(itemHtml, block.ordered, idx))
      })
      continue
    }

    // 表格 → 简单处理
    if (block.type === 'table') {
      parts.push(renderTable(block, theme))
      continue
    }
  }

  // === 签名区 + 互动三连 ===
  // 参考原 skill：签名/三连 是所有文章类型的固定结构（封面+目录+章节标题+签名/三连）
  // 作者签名段：有署名才显示（默认占位 {{作者名}} 由用户替换）
  // 互动三连按钮卡（footer-cta）：默认始终显示
  if (authorName) {
    const bio = authorBio || '热衷于分享 AI 观察与干货'
    const cta = '如果你觉得今天这篇有收获，欢迎点赞、在看、转发三连，我们下篇见'
    parts.push(comps.signature({ author: authorName, bio, cta }))
  }
  parts.push(comps.footerCta())

  // === 组装 ===
  return comps.globalContainer(parts.join('\n'))
}

/**
 * 渲染 inline 节点为 HTML
 */
function renderInline(nodes: InlineNode[], theme: ThemeConfig): string {
  const comps = theme.components
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'text':
          return wrapLeaf(escapeHtml(toFullWidthPunctuation(node.content)))

        case 'code':
          return comps.inlineCode(escapeHtml(node.content))

        case 'strong':
          return comps.boldPrimary(renderInline(node.children, theme))

        case 'em':
          return `<em style="font-style:italic;">${renderInline(node.children, theme)}</em>`

        case 'highlight':
          return comps.highlightMark(renderInline(node.children, theme))

        case 'underline':
          return comps.underlineMark(renderInline(node.children, theme))

        case 'del':
          return comps.delMark(renderInline(node.children, theme))

        case 'link':
          // 公众号不支持外链，只显示文字
          return renderInline(node.children, theme)

        case 'image':
          // 行内图片在段落中较少见，直接渲染
          return comps.image(node.src, node.alt)

        default:
          return ''
      }
    })
    .join('')
}

/**
 * 生成简单封面（无 AI 时的 fallback）
 * 仅使用文章标题，不添加任何广告或硬编码文案
 */
function generateSimpleCover(doc: MarkdownDoc, theme: ThemeConfig): string {
  const date = formatDateLabel()
  const coverData: CoverData = {
    topTag: '',
    date,
    oldBelief: '',
    titleLine1: doc.title,
    highlightWord: '',
    titleLine2: '',
    subtitle: '',
    bottomLeft: '',
    tags: [],
  }
  return theme.components.cover(coverData)
}

/**
 * 渲染表格为简单 HTML
 */
function renderTable(block: Extract<BlockNode, { type: 'table' }>, theme: ThemeConfig): string {
  const v = theme.designVars
  const headerCells = block.headers
    .map(
      (cells) =>
        `<td style="padding:8px 12px;border:1px solid ${v.borderColor};font-size:13px;font-weight:700;color:${v.titleColor};background:${v.lightGrayBg};">${cells.map((c) => (c.type === 'text' ? wrapLeaf(escapeHtml(toFullWidthPunctuation(c.content))) : wrapLeaf(''))).join('')}</td>`
    )
    .join('')

  const bodyRows = block.rows
    .map(
      (row) =>
        `<tr>${row
          .map(
            (cells) =>
              `<td style="padding:8px 12px;border:1px solid ${v.borderColor};font-size:13px;color:${v.bodyColor};">${cells.map((c) => (c.type === 'text' ? wrapLeaf(escapeHtml(toFullWidthPunctuation(c.content))) : wrapLeaf(''))).join('')}</td>`
          )
          .join('')}</tr>`
    )
    .join('')

  return `<section style="margin:0 0 20px;overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-family:${v.fontFamily};"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></section>`
}
