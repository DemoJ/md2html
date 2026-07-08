/**
 * md2html - 公众号排版工具
 * Copyright (C) 2026 diyun <diyun@diyun.site>
 * Licensed under AGPL-3.0-or-later. See LICENSE for full text.
 * Based on gzh-design-skill by 甲木 × 摸鱼小李
 * https://github.com/isjiamu/gzh-design-skill
 */

import type { LLMConfig } from '../core/types'
import { chat } from './llm'

/**
 * 检测文本是否已经是 Markdown 格式
 * 如果不包含任何 Markdown 标记，则认为是纯文本
 */
export function isLikelyMarkdown(text: string): boolean {
  const markers = [
    /^#{1,6}\s/m,           // 标题
    /\*\*[^*]+\*\*/,       // 加粗
    /==[^=]+==/,             // 高亮
    /\+\+[^+]+\+\+/,       // 下划线
    /`[^`]+`/,               // 行内代码
    /```/,                   // 代码块
    /^>\s/m,                 // 引用
    /^[-*]\s/m,             // 无序列表
    /^\d+\.\s/m,           // 有序列表
    /!\[.*\]\(.*\)/,       // 图片
    /\[.*\]\(.*\)/,        // 链接
    /^---$/m,                // 分割线
  ]
  return markers.some(regex => regex.test(text))
}

/**
 * 纯文本 → Markdown 转换
 * 参考原 gzh-design-skill 的 format-normalize.md 启发式规则
 */

const CONVERT_SYSTEM_PROMPT = `你是一个文本格式化助手。将用户提供的纯文本转换为结构化的 Markdown 格式。

转换规则：

1. 标题识别（满足越多越可信）：
   - 行长 ≤ 20 字，且不以句末标点（。！？）结尾
   - 前后都是空行（或位于全文/段落群开头）
   - 带序号前缀：一、二、1. 01 第X章/节/部分 Part N PART N
   - 与后文构成"短行 + 多个长段"的节奏

2. 标题分级：
   - 全文最高频的标题模式定为 ##（二级标题）
   - 其下一级（若有）定为 ###（三级标题）
   - 文首孤立短行定为 #（文章标题）

3. 如果全文识别不出任何标题：
   - 按语义把内容切成 3-6 个主题块
   - 为每块自拟一个 ≤12 字的章节标题（标题要说人话、贴内容，不要"第一部分"这种空壳）

4. 其他映射：
   - 空行分段
   - "引号金句" / 破折号署名 → > 引用块（开头的引用作为文章引言）
   - 1. 2. 3. 或 · / - 起头的行 → 列表
   - 连续的短行如果是并列关系 → 列表
   - 明显的代码/命令/Prompt → 用 \`\`\` 代码块包裹

5. 保留原文实质内容，不增删改写
6. 不要添加任何解释说明，直接输出 Markdown`

/**
 * 将纯文本转换为 Markdown
 */
export async function convertToMarkdown(
  plainText: string,
  config: LLMConfig
): Promise<string> {
  const response = await chat(config, CONVERT_SYSTEM_PROMPT, plainText, {
    temperature: 0.3,
  })

  // 清理可能的 markdown 代码块包裹
  let result = response.trim()
  if (result.startsWith('```markdown')) {
    result = result.replace(/^```markdown\s*\n?/, '').replace(/\n?```\s*$/, '')
  } else if (result.startsWith('```')) {
    result = result.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '')
  }

  return result.trim()
}
