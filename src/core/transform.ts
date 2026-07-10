/**
 * md2html - 公众号排版工具
 * Copyright (C) 2026 diyun <diyun@diyun.site>
 * Licensed under AGPL-3.0-or-later. See LICENSE for full text.
 * Based on gzh-design-skill by 甲木 × 摸鱼小李
 * https://github.com/isjiamu/gzh-design-skill
 */

/**
 * 智能处理工具集
 * - 全角标点转换
 * - <span leaf=""> 包裹
 * - 章节编号
 * - 英文标签生成
 */

/** 半角标点 → 全角标点映射 */
const PUNCT_MAP: Record<string, string> = {
  ',': '，',
  '.': '。',
  '!': '！',
  '?': '？',
  ':': '：',
  ';': '；',
  '(': '（',
  ')': '）',
}

/** 英文直引号 → 中文弯引号（自动配对） */
function convertQuotes(text: string): string {
  let result = ''
  let openDouble = true
  let openSingle = true

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]

    if (ch === '"') {
      result += openDouble ? '「' : '」'
      openDouble = !openDouble
    } else if (ch === "'") {
      // 单引号：检查是否是英文缩写（如 it's, don't）
      const prev = text[i - 1]
      const next = text[i + 1]
      if (prev && /[a-zA-Z]/.test(prev) && next && /[a-zA-Z]/.test(next)) {
        result += "'" // 英文缩写保留
      } else {
        result += openSingle ? '『' : '』'
        openSingle = !openSingle
      }
    } else {
      result += ch
    }
  }

  return result
}

/**
 * 正文全角标点转换
 * 规则：中文字后紧跟半角标点 → 全角；代码块/行内代码内不转换
 */
export function toFullWidthPunctuation(text: string): string {
  let result = ''

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const prev = text[i - 1]

    // 中文字后紧跟半角标点 → 全角
    if (PUNCT_MAP[ch] && prev && /[\u4e00-\u9fff\u3400-\u4dbf]/.test(prev)) {
      result += PUNCT_MAP[ch]
    } else {
      result += ch
    }
  }

  // 转换引号
  return convertQuotes(result)
}

/**
 * HTML 转义：防止文本中的 < > & 等字符被当作 HTML 标签
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * 将文本包裹在 <span leaf=""> 中
 * 公众号编辑器要求所有文字节点用 <span leaf=""> 包裹，否则样式丢失
 */
export function wrapLeaf(text: string): string {
  if (!text) return ''
  return `<span leaf="">${text}</span>`
}

/**
 * 章节编号格式化
 * 01, 02, 03... 末章用 ∞
 */
export function formatChapterNumber(index: number, total: number, isConclusion: boolean): string {
  if (isConclusion && index === total - 1) {
    return '∞'
  }
  return String(index + 1).padStart(2, '0')
}

/** 判断标题是否是结语/总结类（仅匹配明确的结语标记，避免把含"总结"的普通章节误判） */
const CONCLUSION_KEYWORDS = ['写在最后', '结语', '结束语', '终章', '尾声', '后记', '收尾']

export function isConclusionChapter(title: string): boolean {
  return CONCLUSION_KEYWORDS.some((kw) => title.includes(kw))
}

/**
 * 中文章节标题 → 英文标签
 * 常见映射 + 拼音 fallback
 */
const LABEL_MAP: Record<string, string> = {
  '实测': 'TEST',
  '测试': 'TEST',
  '教程': 'TUTORIAL',
  '指南': 'GUIDE',
  '入门': 'GETTING STARTED',
  '总结': 'SUMMARY',
  '结语': 'CONCLUSION',
  '收尾': 'WRAP UP',
  '思考': 'THOUGHTS',
  '反思': 'REFLECTION',
  '对比': 'COMPARE',
  '比较': 'COMPARE',
  '评测': 'REVIEW',
  '测评': 'REVIEW',
  '安装': 'INSTALL',
  '配置': 'CONFIG',
  '部署': 'DEPLOY',
  '使用': 'USAGE',
  '实践': 'PRACTICE',
  '案例': 'CASE',
  '实战': 'BATTLE',
  '原理': 'PRINCIPLE',
  '机制': 'MECHANISM',
  '架构': 'ARCHITECTURE',
  '设计': 'DESIGN',
  '优化': 'OPTIMIZE',
  '进阶': 'ADVANCED',
  '高级': 'ADVANCED',
  '基础': 'BASICS',
  '简介': 'INTRO',
  '介绍': 'INTRO',
  '背景': 'BACKGROUND',
  '现状': 'STATUS',
  '问题': 'PROBLEM',
  '方案': 'SOLUTION',
  '解决': 'SOLUTION',
  '效果': 'EFFECT',
  '结果': 'RESULT',
  '展望': 'OUTLOOK',
  '未来': 'FUTURE',
  '规划': 'PLAN',
  '路线': 'ROADMAP',
  'FAQ': 'FAQ',
  '常见问题': 'FAQ',
  '技巧': 'TIPS',
  '小贴士': 'TIPS',
  '注意': 'NOTE',
  '注意点': 'NOTE',
  '避坑': 'PITFALL',
  '踩坑': 'PITFALL',
}

export function generateEnLabel(title: string): string {
  // 先查映射表
  for (const [cn, en] of Object.entries(LABEL_MAP)) {
    if (title.includes(cn)) {
      return en
    }
  }
  // fallback: 取前两个字符的拼音首字母（简化版，实际可接入拼音库）
  // 暂时用 PART 作为通用 fallback
  return 'SECTION'
}

/**
 * 在段落文本中标记关键词（加下划线）
 * @param html 段落 HTML（已包含 span leaf 包裹）
 * @param keywords 关键词数组
 * @param underlineCSS 下划线 CSS
 * @returns 标记后的 HTML
 */
export function applyKeywordUnderline(html: string, keywords: string[], underlineCSS: string): string {
  if (!keywords || keywords.length === 0) return html

  let result = html
  for (const kw of keywords) {
    if (!kw || kw.length < 2) continue
    // 在 span leaf 内容中查找并替换
    // 匹配 <span leaf="">包含关键词的文本</span>
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(<span leaf="">)([^<]*?)(${escaped})([^<]*?)(</span>)`, 'g')
    result = result.replace(regex, `$1$2</span><span leaf="" style="${underlineCSS}">$3</span><span leaf="">$4$5`)
  }

  return result
}

/**
 * 生成日期标签
 */
export function formatDateLabel(date?: Date): string {
  const d = date || new Date()
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]}`
}
