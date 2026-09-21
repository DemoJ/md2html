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
 * 代码行渲染：转义 HTML 并保住空白，且**不依赖 `white-space:pre`**。
 *
 * 上游 skill 明令禁用 `white-space:pre`：它会把 HTML 源码里 span 前的缩进和行间换行
 * 原样渲染成大左缩进 + 空行；官方规范 1.8 也点名 `<pre>` 在移动端会溢出截断。
 * 这里改用「不可折叠空白」方案，在 `white-space:normal` 下也能保住代码格式：
 *   - 行首缩进空格 → 全部 `&nbsp;`（HTML 默认会折叠并删除行首空白）
 *   - 行内连续空格 → 保留第一个为普通空格（留出折行点），其余转 `&nbsp;` 防止被折叠
 * 行内单个空格保持原样，长行仍能正常换行；制表符按编辑器一致的口径展开为 2 个空格。
 */
export function escapeCodeLine(line: string): string {
  const expanded = line.replace(/\t/g, '  ')
  const indent = expanded.match(/^ +/)?.[0] ?? ''
  const body = expanded.slice(indent.length)
  const bodyHtml = escapeHtml(body).replace(
    / {2,}/g,
    (spaces) => ' ' + '&nbsp;'.repeat(spaces.length - 1)
  )
  return '&nbsp;'.repeat(indent.length) + bodyHtml
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

/** 关键词在一段纯文本中的命中区间 */
interface KeywordHit {
  start: number
  end: number
}

/**
 * 在一段纯文本中定位所有关键词命中区间。
 * 长词优先、命中不重叠，返回结果按位置升序。
 */
function findKeywordHits(text: string, keywords: string[]): KeywordHit[] {
  const candidates: KeywordHit[] = []

  for (const kw of keywords) {
    if (!kw || kw.length < 2) continue
    let from = 0
    while (from <= text.length - kw.length) {
      const idx = text.indexOf(kw, from)
      if (idx === -1) break
      candidates.push({ start: idx, end: idx + kw.length })
      from = idx + kw.length
    }
  }

  // 长词优先，再按出现位置排序
  candidates.sort((a, b) => b.end - b.start - (a.end - a.start) || a.start - b.start)

  const picked: KeywordHit[] = []
  for (const c of candidates) {
    if (picked.some((p) => c.start < p.end && c.end > p.start)) continue
    picked.push(c)
  }
  return picked.sort((a, b) => a.start - b.start)
}

/**
 * 在段落文本中标记关键词（加下划线）
 *
 * 关键：`<span leaf="">` 是公众号编辑器的文本叶子节点，编辑器在保存时会重建它，
 * 挂在它身上的 style 会被丢弃。因此样式一律挂到**外层 `<span>`**，leaf 只包纯文本：
 *   ✅ <span style="border-bottom:2px solid #A7F3D0;"><span leaf="">关键词</span></span>
 *   ❌ <span leaf="" style="border-bottom:2px solid #A7F3D0;">关键词</span>
 *
 * @param html 段落 HTML（文本已用 span leaf 包裹）
 * @param keywords 关键词数组
 * @param underlineCSS 下划线 CSS
 * @returns 标记后的 HTML
 */
export function applyKeywordUnderline(html: string, keywords: string[], underlineCSS: string): string {
  if (!keywords || keywords.length === 0) return html
  if (keywords.filter((k) => k && k.length >= 2).length === 0) return html

  // 只处理"纯文本 leaf"（内容不含子标签），逐节点替换，天然避免重复标记与空节点
  return html.replace(/<span leaf="">([^<]*)<\/span>/g, (whole, text: string) => {
    const hits = findKeywordHits(text, keywords)
    if (hits.length === 0) return whole

    let out = ''
    let cursor = 0
    for (const hit of hits) {
      if (hit.start > cursor) out += wrapLeaf(text.slice(cursor, hit.start))
      out += `<span style="${underlineCSS}">${wrapLeaf(text.slice(hit.start, hit.end))}</span>`
      cursor = hit.end
    }
    if (cursor < text.length) out += wrapLeaf(text.slice(cursor))
    return out
  })
}

/**
 * 移除空元素（上游铁律：结构化区域没有内容时整块删掉，不留空节点）。
 *
 * 主题组件里大量使用「有值才渲染」的模板，但槽位为空时仍会留下
 * `<p style="..."></p>` / `<section style="..."></section>` 这类空壳，
 * 粘贴到公众号后是无效占位节点。这里从内到外反复清理，直到不再变化
 * （移除子元素后父元素可能变空）。
 *
 * 内部含 `<br>`/`<img>`/`<svg>` 的元素不会被移除——它们是合法的占位或媒体容器。
 */
export function stripEmptyElements(html: string): string {
  const EMPTY = /<(section|p|span)\b[^>]*>\s*<\/\1>/gi
  let prev: string
  let out = html
  do {
    prev = out
    out = out.replace(EMPTY, '')
  } while (out !== prev)
  return out
}

/**
 * 生成日期标签
 */
export function formatDateLabel(date?: Date): string {
  const d = date || new Date()
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]}`
}
