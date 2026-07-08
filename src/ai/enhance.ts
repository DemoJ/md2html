/**
 * md2html - 公众号排版工具
 * Copyright (C) 2026 diyun <diyun@diyun.site>
 * Licensed under AGPL-3.0-or-later. See LICENSE for full text.
 * Based on gzh-design-skill by 甲木 × 摸鱼小李
 * https://github.com/isjiamu/gzh-design-skill
 */

import type { AIEnhanceResult, LLMConfig, MarkdownDoc } from '../core/types'
import { inlineToPlainText } from '../core/parser'
import { chat } from './llm'
import { ENHANCE_SYSTEM_PROMPT, buildEnhanceUserPrompt, ARTICLE_TYPE_PROMPT } from './prompts'
import { formatDateLabel } from '../core/transform'

/**
 * AI 增强编排
 * 将文章发送给 LLM，获取关键词、标签、引言、封面等增强信息
 */

export interface EnhanceOptions {
  /** 进度回调 */
  onProgress?: (step: string) => void
}

/**
 * 执行 AI 增强
 */
export async function enhanceArticle(
  doc: MarkdownDoc,
  config: LLMConfig,
  options?: EnhanceOptions
): Promise<AIEnhanceResult | null> {
  const { onProgress } = options || {}

  try {
    // 提取段落、章节和开头引言块
    const paragraphs = extractParagraphs(doc)
    const chapters = extractChapters(doc)
    const openingQuote = extractOpeningQuote(doc)

    if (paragraphs.length === 0) return null

    onProgress?.('正在分析文章内容...')

    // 单次调用获取所有增强信息
    const userPrompt = buildEnhanceUserPrompt(doc.title, paragraphs, chapters, openingQuote)
    const response = await chat(config, ENHANCE_SYSTEM_PROMPT, userPrompt, {
      temperature: 0.7,
    })

    onProgress?.('正在解析增强结果...')

    // 解析 JSON
    const parsed = parseJSONResponse(response)
    if (!parsed) {
      console.error('AI 增强返回的内容无法解析为 JSON:', response.slice(0, 500))
      return null
    }

    // 构建 AIEnhanceResult
    // 注意：introCard 的 text 不再由 AI 生成，而是由 generator 从开头 blockquote 取
    const result: AIEnhanceResult = {
      articleType: parsed.articleType || '随笔',
      keywords: {},
      chapterLabels: {},
      introCard: {
        author: parsed.introCard?.author || undefined,
        keywords: Array.isArray(parsed.introCard?.keywords) ? parsed.introCard.keywords : undefined,
      },
    }

    // 转换 keywords（key 从字符串转数字）
    if (parsed.keywords) {
      for (const [key, value] of Object.entries(parsed.keywords)) {
        const idx = parseInt(key)
        if (!isNaN(idx) && Array.isArray(value)) {
          result.keywords[idx] = value as string[]
        }
      }
    }

    // 转换 chapterLabels
    if (parsed.chapterLabels) {
      for (const [key, value] of Object.entries(parsed.chapterLabels)) {
        const idx = parseInt(key)
        if (!isNaN(idx) && typeof value === 'string') {
          result.chapterLabels[idx] = value
        }
      }
    }

    // 导读章节（AI 挑选的最多 3 个最重要章节序号）
    if (Array.isArray(parsed.tocHighlights)) {
      result.tocHighlights = parsed.tocHighlights
        .map((n: any) => typeof n === 'string' ? parseInt(n) : n)
        .filter((n: any) => typeof n === 'number' && !isNaN(n))
        .slice(0, 3)
    }

    // 封面文案
    if (parsed.coverText) {
      result.coverText = {
        topTag: parsed.coverText.topTag || '',
        date: formatDateLabel(),
        oldBelief: parsed.coverText.oldBelief || '',
        titleLine1: parsed.coverText.titleLine1 || doc.title,
        highlightWord: parsed.coverText.highlightWord || '',
        titleLine2: parsed.coverText.titleLine2 || '',
        subtitle: parsed.coverText.subtitle || '',
        bottomLeft: parsed.coverText.bottomLeft || '',
        tags: Array.isArray(parsed.coverText.tags) ? parsed.coverText.tags : [],
      }
    }

    // 推荐主题
    onProgress?.('正在推荐主题...')
    try {
      const themeRec = await chat(
        config,
        ARTICLE_TYPE_PROMPT,
        `文章标题：${doc.title}\n\n文章前500字：${paragraphs.map((p) => p.text).join('').slice(0, 500)}`,
        { temperature: 0.1, maxTokens: 50 }
      )
      result.recommendedTheme = themeRec.trim()
    } catch {
      // 主题推荐失败不影响主流程
    }

    onProgress?.('AI 增强完成')
    return result
  } catch (err) {
    console.error('AI 增强失败:', err)
    return null
  }
}

/**
 * 从文档中提取正文段落（只取 paragraph 类型）
 */
function extractParagraphs(doc: MarkdownDoc): { index: number; text: string }[] {
  const result: { index: number; text: string }[] = []
  let paraIdx = 0

  for (const block of doc.blocks) {
    if (block.type === 'paragraph') {
      const text = inlineToPlainText(block.children)
      if (text.trim().length > 0) {
        result.push({ index: paraIdx, text })
        paraIdx++
      }
    }
  }

  return result
}

/**
 * 从文档中提取开头引言块（文章最开头的 > 引用块）
 * 参考原 skill：开头引言是紧跟在文章标题之后的第一个 blockquote
 * 如果在遇到 blockquote 之前已有正文段落/章节标题等内容，则认为没有开头引言
 */
function extractOpeningQuote(doc: MarkdownDoc): string | undefined {
  for (let i = 0; i < doc.blocks.length; i++) {
    const block = doc.blocks[i]
    // 跳过文首标题（文章标题）
    if (i === (doc.titleBlockIdx ?? -1)) continue
    if (block.type === 'blockquote') {
      const text = block.children
        .map((c) => (c.type === 'paragraph' ? inlineToPlainText(c.children) : ''))
        .join('')
        .trim()
      return text || undefined
    }
    // 遇到其他内容说明开头没有引言块
    return undefined
  }
  return undefined
}

/**
 * 从文档中提取章节标题
 * 参考原 skill：## 是章节标题；如果文章没有 # 文首标题，
 * 用了 # 作为章节标题也应被当作章节标题
 */
function extractChapters(doc: MarkdownDoc): { index: number; title: string }[] {
  const result: { index: number; title: string }[] = []
  let chIdx = 0
  const titleBlockIdx = doc.titleBlockIdx ?? -1

  doc.blocks.forEach((block, i) => {
    // 跳过文首标题
    if (i === titleBlockIdx) return
    if (block.type === 'heading' && (block.level === 1 || block.level === 2)) {
      result.push({ index: chIdx, title: inlineToPlainText(block.children) })
      chIdx++
    }
  })

  return result
}

/**
 * 从 LLM 响应中解析 JSON
 * 处理 markdown 代码块包裹的情况
 */
function parseJSONResponse(text: string): any | null {
  // 去除前后空白
  let cleaned = text.trim()

  // 去除 markdown 代码块标记
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
  }

  try {
    return JSON.parse(cleaned)
  } catch {
    // 尝试找到第一个 { 和最后一个 } 之间的内容
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1))
      } catch {
        return null
      }
    }
    return null
  }
}
