/**
 * md2html - 公众号排版工具
 * Copyright (C) 2026 diyun <diyun@diyun.site>
 * Licensed under AGPL-3.0-or-later. See LICENSE for full text.
 * Based on gzh-design-skill by 甲木 × 摸鱼小李
 * https://github.com/isjiamu/gzh-design-skill
 */

import type { LLMConfig, LLMMessage } from '../core/types'

/**
 * LLM 调用抽象层
 * 支持 OpenAI 兼容协议（OpenAI / DeepSeek / 通义 / Kimi / 智谱等）
 * 纯前端 fetch 调用，API Key 存 localStorage
 */

export interface LLMResponse {
  content: string
  reasoningContent?: string
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
}

/**
 * 调用 LLM（OpenAI 兼容协议）
 */
export async function callLLM(
  config: LLMConfig,
  messages: LLMMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<LLMResponse> {
  const baseURL = config.baseURL.replace(/\/+$/, '')
  const url = `${baseURL}/chat/completions`

  const body: Record<string, unknown> = {
    model: config.model,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    temperature: options?.temperature ?? config.temperature ?? 0.7,
  }
  if (options?.maxTokens) {
    body.max_tokens = options.maxTokens
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
  }

  // Anthropic 需要特殊 header
  if (config.provider === 'anthropic') {
    headers['anthropic-dangerous-direct-browser-access'] = 'true'
  }

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
  } catch (err) {
    throw new Error(`网络请求失败，可能是 CORS 被拦截或 URL 不可达: ${err instanceof Error ? err.message : String(err)}`)
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText)
    throw new Error(`API 返回 ${res.status}: ${errText.slice(0, 200)}`)
  }

  let data: any
  try {
    data = await res.json()
  } catch {
    throw new Error('API 返回了非 JSON 响应，请检查 Base URL 是否正确')
  }

  // 检查 body 中的 error 字段
  if (data?.error) {
    const errMsg = data.error.message || data.error.code || JSON.stringify(data.error)
    throw new Error(`API 返回错误: ${errMsg}`)
  }

  // 提取 content 和 reasoning_content（分开处理，不混用）
  let content = ''
  let reasoningContent = ''
  const choice = data?.choices?.[0]
  if (choice) {
    const message = choice.message || choice.delta
    if (typeof message?.content === 'string') {
      content = message.content
    } else if (Array.isArray(message?.content)) {
      content = message.content
        .map((c: any) => (c.type === 'text' ? c.text : ''))
        .join('')
    }
    // 推理模型的思考内容（不作为正式回复，仅用于连接测试）
    if (typeof message?.reasoning_content === 'string') {
      reasoningContent = message.reasoning_content
    }
  }

  // content 和 reasoningContent 都为空才算失败
  if (!content && !reasoningContent) {
    const raw = JSON.stringify(data).slice(0, 300)
    throw new Error(`API 返回 200 但无法提取回复内容，原始响应: ${raw}`)
  }

  return {
    content,
    reasoningContent: reasoningContent || undefined,
    usage: data?.usage,
  }
}

/**
 * 简单调用：system + user → 返回 content（不含 reasoning_content）
 */
export async function chat(
  config: LLMConfig,
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const response = await callLLM(
    config,
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    options
  )
  return response.content
}

/**
 * 测试 LLM 连接 — content 或 reasoning_content 有任一非空即算成功
 */
export async function testLLMConnection(config: LLMConfig): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await callLLM(
      config,
      [{ role: 'user', content: '请回复"连接成功"四个字。' }]
    )
    if (response.content.length > 0 || (response.reasoningContent?.length ?? 0) > 0) {
      return { success: true }
    }
    return { success: false, error: 'API 返回了空内容' }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
