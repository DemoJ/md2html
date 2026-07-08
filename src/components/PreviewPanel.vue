<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEditorStore } from '../stores/editor'

const editor = useEditorStore()
const copied = ref(false)
const iframeRef = ref<HTMLIFrameElement | null>(null)
const previewContainerRef = ref<HTMLDivElement | null>(null)

// 防止滚动联动循环的标志
let syncing = false

const hasContent = computed(() => editor.generatedHtml.length > 0)
const hasErrors = computed(() => (editor.validationResult?.errors.length || 0) > 0)
const hasWarnings = computed(() => (editor.validationResult?.warnings.length || 0) > 0)

// 预览用的完整 HTML 文档 — 模拟微信公众号阅读体验
const previewSrcDoc = computed(() => {
  if (!editor.generatedHtml) return ''
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 0;
    background: #fff;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  /* 模拟公众号文章正文区域 */
  .wx-article {
    padding: 20px 16px 40px;
  }
  img { max-width: 100%; }
</style>
</head>
<body>
  <div class="wx-article">${editor.generatedHtml}</div>
</body>
</html>`
})

// iframe 加载后自适应高度
function onIframeLoad() {
  adjustIframeHeight()
}

function adjustIframeHeight() {
  const iframe = iframeRef.value
  if (!iframe) return
  try {
    const doc = iframe.contentDocument
    if (!doc) return
    const height = doc.documentElement.scrollHeight || doc.body.scrollHeight
    iframe.style.height = height + 'px'
  } catch {
    // 跨域时无法访问
  }
}

async function copy() {
  const success = await editor.copyToClipboard()
  if (success) {
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  }
}

// 左→右：编辑器滚动时同步预览
watch(
  () => editor.editorScrollRatio,
  (ratio) => {
    const el = previewContainerRef.value
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    if (max <= 0) return
    syncing = true
    el.scrollTop = ratio * max
    requestAnimationFrame(() => { syncing = false })
  }
)

// 右→左：预览滚动时同步编辑器
function onPreviewScroll() {
  if (syncing) return
  const el = previewContainerRef.value
  if (!el) return
  const max = el.scrollHeight - el.clientHeight
  if (max <= 0) return
  editor.previewScrollRatio = el.scrollTop / max
}

function exportHtml() {
  if (!editor.generatedHtml) return
  const blob = new Blob([editor.generatedHtml], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `排版_${editor.currentTheme.name}.html`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- 预览头部 -->
    <div class="flex h-11 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div class="flex items-center gap-2">
        <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span class="text-sm font-medium text-gray-600">预览</span>
        <span class="text-xs text-gray-300">·</span>
        <span class="text-xs text-gray-400">{{ editor.currentTheme.name }}</span>
      </div>
      <div class="flex items-center gap-2">
        <!-- 校验状态 -->
        <span
          v-if="editor.validationResult"
          class="flex items-center gap-1 text-xs"
          :class="hasErrors ? 'text-red-500' : hasWarnings ? 'text-amber-500' : 'text-emerald-600'"
        >
          <span v-if="!hasErrors && !hasWarnings" class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          <span v-else-if="hasErrors" class="inline-block h-1.5 w-1.5 rounded-full bg-red-500"></span>
          <span v-else class="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"></span>
          {{ hasErrors ? `${editor.validationResult.errors.length} 错误` : hasWarnings ? `${editor.validationResult.warnings.length} 警告` : '校验通过' }}
        </span>

        <!-- 导出 -->
        <button
          v-if="hasContent"
          @click="exportHtml"
          class="rounded-lg border border-gray-200 px-3 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
        >
          导出
        </button>

        <!-- 复制 -->
        <button
          v-if="hasContent"
          @click="copy"
          class="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
        >
          {{ copied ? '✓ 已复制' : '复制到公众号' }}
        </button>
      </div>
    </div>

    <!-- 进度条 -->
    <div v-if="editor.loading" class="border-b border-emerald-100 bg-emerald-50/80 px-4 py-2.5">
      <div class="flex items-center gap-2.5">
        <div class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
        <span class="text-sm text-emerald-700">{{ editor.progressMessage || '处理中...' }}</span>
      </div>
    </div>

    <!-- 预览内容 -->
    <div ref="previewContainerRef" class="preview-container flex-1" @scroll="onPreviewScroll">
      <!-- 空状态 -->
      <div v-if="!hasContent && !editor.loading" class="flex h-full items-center justify-center">
        <div class="text-center">
          <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100/80">
            <svg class="h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-gray-400">还没有预览内容</p>
          <p class="mt-1 text-xs text-gray-300">写好 Markdown 后，点击下方「排版」按钮</p>
        </div>
      </div>

      <!-- 预览 iframe -->
      <iframe
        v-else-if="hasContent"
        ref="iframeRef"
        :srcdoc="previewSrcDoc"
        class="preview-content w-full border-none"
        sandbox="allow-same-origin"
        @load="onIframeLoad"
      ></iframe>
    </div>

    <!-- 校验详情 -->
    <div
      v-if="editor.validationResult && (hasErrors || hasWarnings)"
      class="max-h-28 overflow-y-auto border-t border-gray-200 bg-red-50/30 px-4 py-2"
    >
      <div v-for="(err, i) in editor.validationResult.errors" :key="'e' + i" class="text-xs text-red-500">
        ✗ {{ err.message }}
      </div>
      <div v-for="(warn, i) in editor.validationResult.warnings" :key="'w' + i" class="text-xs text-amber-500">
        ⚠ {{ warn.message }}
      </div>
    </div>
  </div>
</template>
