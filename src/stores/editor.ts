/**
 * md2html - 公众号排版工具
 * Copyright (C) 2026 diyun <diyun@diyun.site>
 * Licensed under AGPL-3.0-or-later. See LICENSE for full text.
 * Based on gzh-design-skill by 甲木 × 摸鱼小李
 * https://github.com/isjiamu/gzh-design-skill
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AIEnhanceResult, ValidationResult } from '../core/types'
import { parseMarkdown } from '../core/parser'
import { generateHtml } from '../core/generator'
import { validateGzhHtml } from '../core/validator'
import { enhanceArticle } from '../ai/enhance'
import { isLikelyMarkdown, convertToMarkdown } from '../ai/convert'
import { useSettingsStore } from './settings'
import { themes, getTheme, defaultTheme } from '../themes'

const MD_STORAGE_KEY = 'md2html-markdown'
const THEME_STORAGE_KEY = 'md2html-theme'

export const useEditorStore = defineStore('editor', () => {
  // Markdown 内容
  const markdown = ref<string>(
    localStorage.getItem(MD_STORAGE_KEY) ||
      `# 欢迎使用 md2html 公众号排版工具

> 把 Markdown 一键排成可直接粘贴进微信公众号编辑器的精致 HTML。

## 为什么需要这个工具

微信公众号编辑器对 HTML 有诸多限制：不支持 \`<style>\` 标签、不支持 CSS class、不支持 \`position:fixed\`。如果你直接粘贴普通 HTML，样式会大面积丢失。

这个工具把所有样式**内联**，并用 \`<span leaf="">\` 包裹所有文字，确保粘贴后格式不丢。

## 核心功能

- **6 套精选主题**：每套都是自成体系的组件库
- **AI 智能排版**：自动标记关键词下划线、生成封面文案
- **合规校验**：确定性检查公众号平台限制
- **一键复制**：点一下直接粘贴到公众号编辑器

## 快速开始

1. 在左侧编辑器写 Markdown
2. 选择主题
3. 预览实时渲染，点击「AI 增强」获得更佳效果
4. 点击「复制到公众号」

> 提示：首次使用前请先配置 LLM API Key，以获得 AI 增强效果。

## 总结

试着把你的文章粘贴到左边，预览会实时渲染。配置 LLM 后点击「AI 增强」获得更佳效果！
`
  )

  // 选中的主题 ID
  const selectedThemeId = ref<string>(
    localStorage.getItem(THEME_STORAGE_KEY) || defaultTheme.id
  )

  // 生成的 HTML
  const generatedHtml = ref<string>('')

  // 校验结果
  const validationResult = ref<ValidationResult | null>(null)

  // AI 增强结果
  const enhanceResult = ref<AIEnhanceResult | null>(null)

  // 是否正在 AI 增强中
  const loading = ref(false)
  const progressMessage = ref('')

  // 滚动联动比例（0-1，双向同步）
  const editorScrollRatio = ref(0)
  const previewScrollRatio = ref(0)

  // 当前主题
  const currentTheme = computed(() => getTheme(selectedThemeId.value) || defaultTheme)

  // 所有主题
  const allThemes = computed(() => themes)

  // 保存 Markdown
  function saveMarkdown() {
    localStorage.setItem(MD_STORAGE_KEY, markdown.value)
  }

  // 更新 Markdown
  function setMarkdown(value: string) {
    markdown.value = value
    saveMarkdown()
  }

  // 选择主题
  function selectTheme(themeId: string) {
    selectedThemeId.value = themeId
    localStorage.setItem(THEME_STORAGE_KEY, themeId)
  }

  // 基础渲染（无 AI，实时调用）
  function convertBasic() {
    try {
      const settings = useSettingsStore()
      const doc = parseMarkdown(markdown.value)
      const html = generateHtml(doc, {
        theme: currentTheme.value,
        enhance: enhanceResult.value,
        authorName: settings.authorName || undefined,
        authorBio: settings.authorBio || undefined,
        showCover: settings.showCover,
        showToc: settings.showToc,
      })
      generatedHtml.value = html
      validationResult.value = validateGzhHtml(html)
    } catch (err) {
      console.error('渲染失败:', err)
    }
  }

  // 清除 AI 增强结果（markdown 变更时调用）
  function clearEnhance() {
    if (enhanceResult.value) {
      enhanceResult.value = null
    }
  }

  // AI 增强（需要 LLM 配置）
  // 自动检测：如果内容不是 Markdown，先转换为 Markdown 再增强
  async function enhanceWithAI(): Promise<{ success: boolean; message?: string }> {
    const settings = useSettingsStore()
    if (!settings.isConfigured) {
      return { success: false, message: '请先配置 LLM API Key' }
    }

    loading.value = true
    progressMessage.value = '正在解析内容...'

    try {
      // 检测是否为 Markdown，非 Markdown 自动转换
      if (!isLikelyMarkdown(markdown.value)) {
        progressMessage.value = '检测到非 Markdown 文本，正在智能转换...'
        const converted = await convertToMarkdown(markdown.value, settings.llmConfig)
        markdown.value = converted
        localStorage.setItem(MD_STORAGE_KEY, converted)
      }

      const doc = parseMarkdown(markdown.value)

      progressMessage.value = '正在 AI 增强...'
      const enhance = await enhanceArticle(doc, settings.llmConfig, {
        onProgress: (step) => {
          progressMessage.value = step
        },
      })

      // AI 返回 null = JSON 解析失败或无段落
      if (!enhance) {
        progressMessage.value = 'AI 增强未返回有效结果（可能是推理模型 token 不足，请查看控制台日志）'
        return { success: false, message: 'AI 未返回有效结果，请检查控制台日志或更换模型' }
      }

      // 如果 AI 推荐了主题，自动切换
      if (enhance?.recommendedTheme && getTheme(enhance.recommendedTheme)) {
        selectTheme(enhance.recommendedTheme)
      }

      enhanceResult.value = enhance

      // 用 AI 结果重新生成
      progressMessage.value = '正在生成 HTML...'
      const html = generateHtml(doc, {
        theme: currentTheme.value,
        enhance,
        authorName: settings.authorName || undefined,
        authorBio: settings.authorBio || undefined,
        showCover: settings.showCover,
        showToc: settings.showToc,
      })
      generatedHtml.value = html
      validationResult.value = validateGzhHtml(html)

      progressMessage.value = ''
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      progressMessage.value = `AI 增强失败: ${message}`
      console.error(err)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  // 复制到剪贴板
  async function copyToClipboard(): Promise<boolean> {
    if (!generatedHtml.value) return false

    try {
      // 创建一个临时容器，渲染 HTML，然后复制富文本
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = generatedHtml.value
      tempDiv.style.position = 'fixed'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '0'
      tempDiv.style.width = '677px'
      document.body.appendChild(tempDiv)

      // 选中并复制
      const range = document.createRange()
      range.selectNodeContents(tempDiv)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)

      const success = document.execCommand('copy')
      selection?.removeAllRanges()
      document.body.removeChild(tempDiv)

      return success
    } catch (err) {
      console.error('复制失败:', err)
      return false
    }
  }

  // 导出 HTML 文件
  function exportHtml(): string {
    return generatedHtml.value
  }

  return {
    markdown,
    selectedThemeId,
    currentTheme,
    allThemes,
    generatedHtml,
    validationResult,
    enhanceResult,
    loading,
    progressMessage,
    editorScrollRatio,
    previewScrollRatio,
    setMarkdown,
    selectTheme,
    convertBasic,
    clearEnhance,
    enhanceWithAI,
    copyToClipboard,
    exportHtml,
  }
})
