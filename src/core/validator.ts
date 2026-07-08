/**
 * md2html - 公众号排版工具
 * Copyright (C) 2026 diyun <diyun@diyun.site>
 * Licensed under AGPL-3.0-or-later. See LICENSE for full text.
 * Based on gzh-design-skill by 甲木 × 摸鱼小李
 * https://github.com/isjiamu/gzh-design-skill
 */

import type { ValidationResult, ValidationIssue } from './types'

/** 标签/属性级禁止项（用正则检查原始 HTML，文本已转义不会误报） */
const TAG_FORBIDDEN: { regex: RegExp; message: string }[] = [
  { regex: /<style[\s>]/i, message: '<style> 标签会被过滤，样式必须内联' },
  { regex: /<script[\s>]/i, message: '<script> 标签会被过滤' },
  { regex: /<\/?div[\s>]/i, message: '<div> 会被改写，请用 <section>' },
  { regex: /<link[\s>]/i, message: '外部 <link>（CSS/字体）会被过滤' },
  { regex: /\sclass\s*=/i, message: 'class 属性会被剥离，请用内联 style' },
  { regex: /\sid\s*=/i, message: 'id 属性会被剥离' },
]

/** CSS 属性级禁止项（只检查 style="" 属性内的内容，不检查正文文本） */
const CSS_FORBIDDEN: { regex: RegExp; message: string }[] = [
  { regex: /position\s*:\s*(fixed|absolute|sticky)/i, message: 'position fixed/absolute/sticky 不被支持' },
  { regex: /float\s*:/i, message: 'float 不被支持' },
  { regex: /display\s*:\s*grid/i, message: 'display:grid 不被支持，请用 flex' },
  { regex: /var\s*\(\s*--/i, message: 'CSS 变量 var(--x) 不被支持，请写死值' },
  { regex: /url\s*\(\s*['"]?https?:\/\/[^)]*\.(woff2?|ttf|otf|eot)/i, message: '外部字体不被支持' },
  { regex: /@media/i, message: '@media 媒体查询不被支持' },
  { regex: /@keyframes/i, message: '@keyframes 动画不被支持' },
  { regex: /@import/i, message: '@import 不被支持' },
]

const CJK_REGEX = /[\u4e00-\u9fff\u3400-\u4dbf]/
const HALF_PUNCT = /[\u4e00-\u9fff\u3400-\u4dbf][,;!?]/
const CODE_STYLE = /monospace|white-space\s*:\s*pre|courier|consolas|sf mono/i

/**
 * 校验生成的 HTML 是否符合公众号平台限制
 * 移植自原 skill 的 validate_gzh_html.py，改进为只检查 style 属性内的 CSS
 */
export function validateGzhHtml(html: string): ValidationResult {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []

  // 1. 检查禁止标签/属性（正则检查原始 HTML）
  for (const { regex, message } of TAG_FORBIDDEN) {
    const matches = html.match(new RegExp(regex.source, regex.flags))
    if (matches) {
      errors.push({ level: 'ERROR', message: `${message}（命中 ${matches.length} 处）` })
    }
  }

  // 2. 检查禁止 CSS 属性（只检查 style="" 属性内的内容）
  const styleValues = extractStyleAttributes(html)
  for (const { regex, message } of CSS_FORBIDDEN) {
    let hitCount = 0
    for (const styleVal of styleValues) {
      const matches = styleVal.match(new RegExp(regex.source, regex.flags))
      if (matches) {
        hitCount += matches.length
      }
    }
    if (hitCount > 0) {
      errors.push({ level: 'ERROR', message: `${message}（命中 ${hitCount} 处）` })
    }
  }

  // 3. 检查 <span leaf=""> 包裹
  const leafCount = (html.match(/<span\s+leaf\s*=\s*""/gi) || []).length
  const hasCJK = CJK_REGEX.test(html)

  if (hasCJK && leafCount === 0) {
    errors.push({
      level: 'ERROR',
      message: '全文没有任何 <span leaf=""> 包裹——粘贴到公众号后样式会大面积丢失',
    })
  } else {
    const unwrapped = checkUnwrappedText(html)
    if (unwrapped.length > 0) {
      const sample = unwrapped.slice(0, 5).map((s) => `「${s}」`).join('；')
      warnings.push({
        level: 'WARNING',
        message: `${unwrapped.length} 处中文文本未被 <span leaf> 包裹，样式可能丢失。例：${sample}`,
      })
    }
  }

  // 4. 检查半角标点
  const halfPunctIssues = checkHalfPunctuation(html)
  if (halfPunctIssues.length > 0) {
    const sample = halfPunctIssues.slice(0, 5).map((s) => `「${s}」`).join('；')
    warnings.push({
      level: 'WARNING',
      message: `${halfPunctIssues.length} 处正文疑似半角标点/英文引号，应改中文全角（代码块内不计）。例：${sample}`,
    })
  }

  return {
    errors,
    warnings,
    leafCount,
    passed: errors.length === 0,
  }
}

/** 从 HTML 中提取所有 style 属性的值 */
function extractStyleAttributes(html: string): string[] {
  const styles: string[] = []
  const regex = /style\s*=\s*"([^"]*)"/gi
  let match: RegExpExecArray | null
  while ((match = regex.exec(html)) !== null) {
    styles.push(match[1])
  }
  return styles
}

/** 检查未包裹在 <span leaf> 内的中文文本 */
function checkUnwrappedText(html: string): string[] {
  const unwrapped: string[] = []

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    function walk(node: Node, inLeaf: boolean, inCode: boolean) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim() || ''
        if (!text || !CJK_REGEX.test(text)) return
        if (inCode) return
        if (!inLeaf) {
          const snippet = text.slice(0, 24) + (text.length > 24 ? '…' : '')
          unwrapped.push(snippet)
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element
        const isLeaf = el.tagName === 'SPAN' && el.hasAttribute('leaf')
        const style = el.getAttribute('style') || ''
        const isCode = CODE_STYLE.test(style)
        const skipTags = ['HEAD', 'TITLE', 'STYLE', 'SCRIPT']
        if (skipTags.includes(el.tagName)) return

        for (const child of el.childNodes) {
          walk(child, inLeaf || isLeaf, inCode || isCode)
        }
      }
    }

    walk(doc.body, false, false)
  } catch {
    // DOMParser 失败时跳过
  }

  return unwrapped
}

/** 检查正文中的半角标点（代码块内不计） */
function checkHalfPunctuation(html: string): string[] {
  const issues: string[] = []

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    function walk(node: Node, inCode: boolean) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || ''
        if (!CJK_REGEX.test(text)) return
        if (inCode) return

        if (HALF_PUNCT.test(text) || /["']/.test(text)) {
          const snippet = text.slice(0, 24) + (text.length > 24 ? '…' : '')
          issues.push(snippet)
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element
        const style = el.getAttribute('style') || ''
        const isCode = CODE_STYLE.test(style)
        const skipTags = ['HEAD', 'TITLE', 'STYLE', 'SCRIPT']
        if (skipTags.includes(el.tagName)) return

        for (const child of el.childNodes) {
          walk(child, inCode || isCode)
        }
      }
    }

    walk(doc.body, false)
  } catch {
    // DOMParser 失败时跳过
  }

  return issues
}
