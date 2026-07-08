/**
 * md2html - 公众号排版工具
 * Copyright (C) 2026 diyun <diyun@diyun.site>
 * Licensed under AGPL-3.0-or-later. See LICENSE for full text.
 * Based on gzh-design-skill by 甲木 × 摸鱼小李
 * https://github.com/isjiamu/gzh-design-skill
 */

// ===== Markdown AST 类型 =====

export type InlineNode =
  | { type: 'text'; content: string }
  | { type: 'strong'; children: InlineNode[] }
  | { type: 'em'; children: InlineNode[] }
  | { type: 'code'; content: string }
  | { type: 'highlight'; children: InlineNode[] }     // ==text==
  | { type: 'underline'; children: InlineNode[] }      // <u>text</u> 或 ++text++
  | { type: 'del'; children: InlineNode[] }            // ~~text~~
  | { type: 'link'; href: string; children: InlineNode[] }
  | { type: 'image'; src: string; alt: string }

export type BlockNode =
  | { type: 'heading'; level: number; children: InlineNode[] }
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'blockquote'; children: BlockNode[] }
  | { type: 'code_block'; lang: string; content: string }
  | { type: 'image'; src: string; alt: string }
  | { type: 'hr' }
  | { type: 'list'; ordered: boolean; items: BlockNode[][] }
  | { type: 'list_item'; children: BlockNode[] }
  | { type: 'table'; headers: InlineNode[][]; rows: InlineNode[][][] }

export interface MarkdownDoc {
  title: string
  /** 文章标题在 blocks 中的索引，-1 表示没有独立的文章标题 */
  titleBlockIdx: number
  blocks: BlockNode[]
}

// ===== 主题类型 =====

export interface DesignVars {
  primary: string
  secondary?: string
  lightBg: string
  lightBorder: string
  highlight: string
  highlightBg?: string
  titleColor: string
  bodyColor: string
  secondaryText: string
  mutedText: string
  borderColor: string
  lightGrayBg: string
  bodyFontSize: string
  bodyLineHeight: string
  fontFamily: string
  [key: string]: string | undefined
}

export interface ThemeComponents {
  globalContainer: (children: string) => string
  cover: (data: CoverData) => string
  introCard: (data: IntroData) => string
  toc: (items: TocItem[]) => string
  chapterTitle: (data: ChapterTitleData) => string
  bodyParagraph: (html: string) => string
  boldPrimary: (html: string) => string
  highlightMark: (html: string) => string
  underlineMark: (html: string) => string
  delMark: (html: string) => string
  quoteBlock: (html: string) => string
  codeBlockDark: (lang: string, lines: string[]) => string
  codeBlockLight: (lang: string, lines: string[]) => string
  inlineCode: (code: string) => string
  image: (src: string, alt: string) => string
  gifImage: (src: string, alt: string) => string
  placeholder: (text: string) => string
  leftBarTitle: (text: string) => string
  pillTitle: (text: string) => string
  numberedTitle: (num: string, text: string) => string
  goldQuote: (text: string) => string
  tipBlock: (label: string, text: string) => string
  signature: (data: SignatureData) => string
  hr: () => string
  listItem: (html: string, ordered: boolean, index: number) => string
}

export interface CoverData {
  topTag: string
  date: string
  oldBelief: string
  titleLine1: string
  highlightWord: string
  titleLine2: string
  subtitle: string
  bottomLeft: string
  tags: string[]
}

export interface IntroData {
  text: string
  author?: string
}

export interface TocItem {
  num: string
  title: string
}

export interface ChapterTitleData {
  num: string
  enLabel: string
  title: string
}

export interface SignatureData {
  author: string
  bio: string
  cta: string
}

export interface ThemeConfig {
  id: string
  name: string
  primary: string
  underlineCSS: string
  description: string
  suitableFor: string
  designVars: DesignVars
  components: ThemeComponents
  skeleton: string[]
  recipe: Record<string, string[]>
  mapping: Record<string, string>
}

// ===== AI 增强类型 =====

export interface AIEnhanceResult {
  articleType: string
  keywords: Record<number, string[]>      // paragraphIndex → 关键词数组
  chapterLabels: Record<number, string>   // chapterIndex → 英文标签
  introCard: { author?: string; keywords?: string[] }  // keywords: 引言块中需高亮的词；text 由开头 blockquote 提供
  tocHighlights?: number[]                // AI 挑选的导读章节序号（最多3个），fallback 取前3个
  coverText?: CoverData
  recommendedTheme?: string
}

// ===== 显示设置 =====

export interface DisplaySettings {
  showCover: boolean
  showToc: boolean
}

// ===== LLM 配置类型 =====

export interface LLMConfig {
  provider: string
  baseURL: string
  apiKey: string
  model: string
  temperature: number
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// ===== 校验类型 =====

export interface ValidationIssue {
  level: 'ERROR' | 'WARNING'
  message: string
}

export interface ValidationResult {
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  leafCount: number
  passed: boolean
}
