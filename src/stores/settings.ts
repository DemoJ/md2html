/**
 * md2html - 公众号排版工具
 * Copyright (C) 2026 diyun <diyun@diyun.site>
 * Licensed under AGPL-3.0-or-later. See LICENSE for full text.
 * Based on gzh-design-skill by 甲木 × 摸鱼小李
 * https://github.com/isjiamu/gzh-design-skill
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LLMConfig } from '../core/types'

const STORAGE_KEY = 'md2html-llm-config'
const DISPLAY_KEY = 'md2html-display-settings'

/** 预设 LLM 提供商 */
export const LLM_PRESETS: { label: string; provider: string; baseURL: string; model: string }[] = [
  { label: 'DeepSeek', provider: 'deepseek', baseURL: 'https://api.deepseek.com/v1', model: 'deepseek-v4-flash' },
  { label: 'OpenAI', provider: 'openai', baseURL: 'https://api.openai.com/v1', model: 'gpt-5.5' },
  { label: '通义千问', provider: 'qwen', baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen3.7-plus' },
  { label: 'Kimi', provider: 'kimi', baseURL: 'https://api.moonshot.cn/v1', model: 'kimi-k2.6' },
  { label: '智谱 GLM', provider: 'zhipu', baseURL: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-5.2' },
  { label: '自定义', provider: 'custom', baseURL: '', model: '' },
]

export const useSettingsStore = defineStore('settings', () => {
  // LLM 配置
  const llmConfig = ref<LLMConfig>({
    provider: 'deepseek',
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: '',
    model: 'deepseek-v4-flash',
    temperature: 0.7,
  })

  // 显示设置
  const showCover = ref(true)
  const showToc = ref(true)

  // 署名设置（持久化，多篇文章复用）
  const authorName = ref('')
  const authorBio = ref('')

  // 从 localStorage 加载
  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        llmConfig.value = { ...llmConfig.value, ...parsed }
      }
    } catch {
      // 忽略解析错误
    }
    try {
      const displaySaved = localStorage.getItem(DISPLAY_KEY)
      if (displaySaved) {
        const displayParsed = JSON.parse(displaySaved)
        showCover.value = displayParsed.showCover ?? true
        showToc.value = displayParsed.showToc ?? true
        authorName.value = displayParsed.authorName ?? ''
        authorBio.value = displayParsed.authorBio ?? ''
      }
    } catch {
      // 忽略解析错误
    }
  }

  // 保存到 localStorage
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(llmConfig.value))
    } catch {
      // 忽略存储错误
    }
  }

  // 保存显示设置（包含署名）
  function saveDisplay() {
    try {
      localStorage.setItem(DISPLAY_KEY, JSON.stringify({
        showCover: showCover.value,
        showToc: showToc.value,
        authorName: authorName.value,
        authorBio: authorBio.value,
      }))
    } catch {
      // 忽略存储错误
    }
  }

  // 切换显示设置
  function toggleCover() {
    showCover.value = !showCover.value
    saveDisplay()
  }
  function toggleToc() {
    showToc.value = !showToc.value
    saveDisplay()
  }

  // 更新署名
  function updateAuthor(name: string, bio: string) {
    authorName.value = name
    authorBio.value = bio
    saveDisplay()
  }

  // 是否已配置
  const isConfigured = computed(() => !!llmConfig.value.apiKey && !!llmConfig.value.baseURL)

  // 更新配置
  function updateConfig(config: Partial<LLMConfig>) {
    llmConfig.value = { ...llmConfig.value, ...config }
    save()
  }

  // 选择预设
  function selectPreset(preset: typeof LLM_PRESETS[0]) {
    llmConfig.value = {
      ...llmConfig.value,
      provider: preset.provider,
      baseURL: preset.baseURL,
      model: preset.model,
    }
    save()
  }

  // 初始化时加载
  load()

  return {
    llmConfig,
    showCover,
    showToc,
    authorName,
    authorBio,
    isConfigured,
    updateConfig,
    selectPreset,
    toggleCover,
    toggleToc,
    updateAuthor,
    load,
    save,
  }
})
