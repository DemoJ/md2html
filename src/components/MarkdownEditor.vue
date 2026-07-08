<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useEditorStore } from '../stores/editor'

const editor = useEditorStore()
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// 防止滚动联动循环的标志
let syncing = false

function onInput(e: Event) {
  const target = e.target as HTMLTextAreaElement
  editor.setMarkdown(target.value)
}

// Tab 键支持缩进
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Tab') {
    e.preventDefault()
    const target = e.target as HTMLTextAreaElement
    const start = target.selectionStart
    const end = target.selectionEnd
    const value = target.value
    const newValue = value.slice(0, start) + '  ' + value.slice(end)
    editor.setMarkdown(newValue)
    nextTick(() => {
      target.selectionStart = target.selectionEnd = start + 2
    })
  }
}

// 左→右：编辑器滚动时同步预览
function onScroll() {
  if (syncing) return
  const el = textareaRef.value
  if (!el) return
  const max = el.scrollHeight - el.clientHeight
  if (max <= 0) return
  editor.editorScrollRatio = el.scrollTop / max
}

// 右→左：预览滚动时同步编辑器
watch(
  () => editor.previewScrollRatio,
  (ratio) => {
    const el = textareaRef.value
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    if (max <= 0) return
    syncing = true
    el.scrollTop = ratio * max
    requestAnimationFrame(() => { syncing = false })
  }
)
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- 编辑器头部 -->
    <div class="flex h-11 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div class="flex items-center gap-2">
        <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span class="text-sm font-medium text-gray-600">Markdown 编辑器</span>
        <span class="text-xs text-gray-300">|</span>
        <span class="text-xs text-gray-400">也支持纯文本，点击 AI 增强会自动转换为 Markdown</span>
      </div>
      <span class="text-xs text-gray-400">{{ editor.markdown.length }} 字符</span>
    </div>

    <!-- 编辑器 -->
    <textarea
      ref="textareaRef"
      :value="editor.markdown"
      @input="onInput"
      @keydown="onKeyDown"
      @scroll="onScroll"
      class="md-editor flex-1 resize-none border-none bg-white p-4 outline-none"
      placeholder="在此输入 Markdown 或纯文本内容..."
      spellcheck="false"
    ></textarea>
  </div>
</template>
