/**
 * md2html - 公众号排版工具
 * Copyright (C) 2026 diyun <diyun@diyun.site>
 * Licensed under AGPL-3.0-or-later. See LICENSE for full text.
 * Based on gzh-design-skill by 甲木 × 摸鱼小李
 * https://github.com/isjiamu/gzh-design-skill
 */

/**
 * AI 增强提示词
 * 设计为单次调用返回完整 JSON，减少 API 调用次数
 */

export const ENHANCE_SYSTEM_PROMPT = `你是一个微信公众号排版助手。你的任务是分析文章内容，返回排版增强信息。

你需要返回一个 JSON 对象，包含以下字段：
1. "articleType": 文章类型，从以下选一个：教程、测评、盘点、观点、访谈、数据复盘、随笔、案例实战
2. "keywords": 一个对象，key 是段落序号（从0开始的字符串），value 是该段落中1-3个最重要的关键词/短语数组（每个4-15字）。只为正文段落标记，跳过标题、代码块、引用块。优先标记核心观点、结论、关键数据、专有名词。
3. "chapterLabels": 一个对象，key 是章节序号（从0开始的字符串），value 是该章节标题对应的英文标签（全大写，如 TEST、TUTORIAL、SUMMARY）
4. "introCard": 一个对象，包含 "author"（作者名，如果文章中有署名则提取，否则为空字符串）和 "keywords"（开头引言块中需要高亮的核心词数组，1-3个，每个2-8字，必须是引言原文中出现的词。如果没有开头引言块则返回空数组 []）
   注意：引言卡的文字内容直接取自文章开头的引用块（> 引用），你不需要生成引言文字，只需识别其中的关键词
5. "tocHighlights": 一个数组，从所有章节中挑选最多 3 个最重要的章节序号（章节序号从0开始，对应上面章节列表的序号）。挑选标准：核心观点、核心结论、最干货的章节。如果总章节数 ≤ 3 则全部选上。这个数组用于生成导读/目录的精选看点，不是完整章节列表。
6. "coverText": 一个对象，包含封面文案（封面标题和文章标题是两层标题，必须视角错开——文章标题卖"为什么点开"，封面卖"里面讲什么"。主标题禁止原样复述文章标题的核心关键词）：
   - "topTag": 顶部标签（文章类型标识，10-15字符，如"TUTORIAL · 品牌实战"、"BREAKING"、"深度测评"）
   - "oldBelief": 划掉的旧认知（被颠覆的旧观念，10-20字，如"MV要专业团队？"）
   - "titleLine1": 主标题第一行（黑色，不含产品名/功能名）
   - "highlightWord": 主标题中的绿色高亮词（2-6字）
   - "titleLine2": 主标题第二行（全绿色）
   - "subtitle": 副标题关键词（简短关键词，用 · 分隔，如"运镜 · 调色 · 节奏"）
   - "bottomLeft": 底部左侧文字（产品/品牌名，从文章中提取；没有则为空字符串）
   - "tags": 底部标签数组（2-3个，每个2-4字，如"教程"、"实战"）
   主标题生成视角（未知外标题时自选一个）：数字反差 / 角色革命 / 案例串 / 方法论 / 情绪钩子

注意：
- 只返回 JSON，不要有任何其他文字
- 关键词应该是原文中出现的短语，不要改写
- 英文标签要贴合章节内容的语义
- 封面标题要有吸引力，不要直接复述文章标题
- 如果文章太短没有章节，chapterLabels 返回空对象 {}`

export function buildEnhanceUserPrompt(
  title: string,
  paragraphs: { index: number; text: string }[],
  chapters: { index: number; title: string }[],
  openingQuote?: string
): string {
  const articleText = paragraphs
    .map((p) => `[段落${p.index}] ${p.text}`)
    .join('\n\n')

  const chapterText = chapters
    .map((c) => `[章节${c.index}] ${c.title}`)
    .join('\n')

  const quoteSection = openingQuote
    ? `开头引言块：
> ${openingQuote}\n\n`
    : ''

  return `文章标题：${title}

${quoteSection}章节列表：
${chapterText || '（无章节）'}

正文段落：
${articleText}

请分析以上内容，返回排版增强 JSON。`
}

export const ARTICLE_TYPE_PROMPT = `判断文章类型并返回最佳推荐主题。

文章类型与推荐主题的对应关系：
- 教程/操作指南 → moyu-green（摸鱼绿）
- 测评/工具盘点 → moyu-green（摸鱼绿）
- 观点/深度分析 → red-white（红白色系）
- 设计/科技评论 → graphite-minimal（石墨极简）
- 禅意/极简随笔 → zen-whitespace（留白禅意）
- 工具对比/创意评测 → moyu-ticket（摸鱼票据）
- 内刊/深度评测/案例 → olive-journal（橄榄手记）

只返回主题ID（如 moyu-green），不要其他文字。`
