<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useEditorStore } from '../stores/editor'

const editor = useEditorStore()
const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

function toggle() {
  open.value = !open.value
}

function selectTheme(id: string) {
  editor.selectTheme(id)
  open.value = false
}

function onClickOutside(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))

const currentTheme = editor.allThemes.find((t) => t.id === editor.selectedThemeId)
</script>

<template>
  <div ref="rootRef" class="relative">
    <!-- 触发器 -->
    <button
      @click="toggle"
      class="flex items-center gap-1.5 outline-none"
    >
      <svg class="h-3.5 w-3.5 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
      <span class="flex items-center gap-1.5 text-sm font-medium text-gray-700">
        {{ currentTheme?.name || '选择主题' }}
      </span>
      <svg
        class="h-3.5 w-3.5 text-gray-400 transition-transform"
        :class="open ? 'rotate-180' : ''"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- 下拉面板 -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="open"
        class="absolute right-0 top-full z-50 mt-1.5 min-w-[180px] overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg shadow-black/8"
      >
        <button
          v-for="theme in editor.allThemes"
          :key="theme.id"
          @click="selectTheme(theme.id)"
          class="flex w-full items-center justify-between px-3.5 py-2 text-sm transition-colors"
          :class="theme.id === editor.selectedThemeId
            ? 'bg-emerald-50 text-emerald-700'
            : 'text-gray-600 hover:bg-gray-50'"
        >
          <span class="font-medium">{{ theme.name }}</span>
          <!-- 选中标记 -->
          <svg
            v-if="theme.id === editor.selectedThemeId"
            class="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>
