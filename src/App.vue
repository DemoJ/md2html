<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useEditorStore } from './stores/editor'
import { useSettingsStore } from './stores/settings'
import MarkdownEditor from './components/MarkdownEditor.vue'
import ThemePicker from './components/ThemePicker.vue'
import PreviewPanel from './components/PreviewPanel.vue'
import SettingsModal from './components/SettingsModal.vue'
import AboutModal from './components/AboutModal.vue'

const editor = useEditorStore()
const settings = useSettingsStore()

const showSettings = ref(false)
const showAbout = ref(false)

// 防抖定时器
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// Markdown 变更：防抖渲染 + 清除旧 AI 结果
watch(
  () => editor.markdown,
  () => {
    editor.clearEnhance()
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      editor.convertBasic()
    }, 400)
  }
)

// 主题变更：立即重新渲染
watch(
  () => editor.selectedThemeId,
  () => {
    editor.convertBasic()
  }
)

// 显示设置变更：立即重新渲染
watch(
  () => [settings.showCover, settings.showToc],
  () => {
    editor.convertBasic()
  }
)

// 署名变更：防抖渲染
watch(
  [() => settings.authorName, () => settings.authorBio],
  () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      editor.convertBasic()
    }, 400)
  }
)

// 初始渲染
onMounted(() => {
  editor.convertBasic()
})

// AI 增强按钮点击
async function handleAIEnhance() {
  if (!settings.isConfigured) {
    showSettings.value = true
    return
  }
  await editor.enhanceWithAI()
}
</script>

<template>
  <div class="flex h-screen flex-col bg-white">
    <!-- 顶部导航栏 -->
    <header class="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
      <!-- Logo -->
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <span class="text-sm font-black">M</span>
        </div>
        <span class="text-base font-bold text-gray-800">md2html</span>
        <span class="hidden text-xs text-gray-400 lg:inline">公众号排版工具</span>
      </div>

      <!-- 右侧操作 -->
      <div class="flex items-center gap-1">
        <!-- 主题选择 -->
        <div class="mr-3 flex items-center rounded-lg bg-gray-50 py-1.5 pl-3.5 pr-5 ring-1 ring-gray-200 hover:bg-gray-100">
          <ThemePicker />
        </div>

        <!-- 分隔线 -->
        <div class="h-5 w-px bg-gray-200"></div>

        <!-- 关于 -->
        <button
          @click="showAbout = true"
          class="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          title="关于"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <!-- 设置 -->
        <button
          @click="showSettings = true"
          class="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          title="设置"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>

    <!-- 未配置 LLM 提示 -->
    <div
      v-if="!settings.isConfigured"
      class="flex items-center justify-between bg-amber-50 px-4 py-2 text-sm text-amber-700"
    >
      <span>⚠ 未配置 LLM API Key，预览为纯规则渲染。配置后可点击「AI 增强」获得关键词下划线、智能封面等效果。</span>
      <button
        @click="showSettings = true"
        class="shrink-0 rounded-lg bg-amber-600 px-3 py-1 text-xs text-white hover:bg-amber-700"
      >
        去配置
      </button>
    </div>

    <!-- 主体区域：编辑器 + 预览 -->
    <main class="flex flex-1 overflow-hidden">
      <!-- 左侧编辑器 -->
      <div class="w-1/2 border-r border-gray-200">
        <MarkdownEditor />
      </div>

      <!-- 右侧预览 -->
      <div class="w-1/2">
        <PreviewPanel />
      </div>
    </main>

    <!-- 底部工具栏 -->
    <footer class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
      <!-- 左侧状态 -->
      <div class="flex items-center gap-3">
        <span v-if="editor.validationResult" class="text-xs text-gray-400">
          span leaf: {{ editor.validationResult.leafCount }} 处
        </span>
        <span
          v-if="editor.enhanceResult"
          class="flex items-center gap-1 text-xs text-emerald-500"
        >
          <span class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          AI 已增强 · {{ editor.enhanceResult.articleType }}
        </span>
      </div>

      <!-- AI 增强按钮 -->
      <button
        @click="handleAIEnhance"
        :disabled="editor.loading"
        class="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-50"
        :class="editor.enhanceResult
          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
          : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg'"
      >
        <svg
          v-if="editor.loading"
          class="h-4 w-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <svg
          v-else-if="editor.enhanceResult"
          class="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg
          v-else
          class="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        <span>{{ editor.loading ? 'AI 增强中...' : editor.enhanceResult ? '重新 AI 增强' : 'AI 增强' }}</span>
      </button>
    </footer>

    <!-- 设置弹窗 -->
    <SettingsModal :visible="showSettings" @close="showSettings = false" />

    <!-- 关于弹窗 -->
    <AboutModal :visible="showAbout" @close="showAbout = false" />
  </div>
</template>
