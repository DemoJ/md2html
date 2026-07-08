<script setup lang="ts">
defineProps<{ visible: boolean }>()
const emit = defineEmits<{ close: [] }>()

const projectGithub = 'https://github.com/demoj/md2html'
const skillGithub = 'https://github.com/isjiamu/gzh-design-skill'

function close() {
  emit('close')
}
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    @click.self="close"
  >
    <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-800">关于 md2html</h2>
        <button
          @click="close"
          class="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-4 text-sm text-gray-600">
        <!-- 项目简介 -->
        <p>
          md2html 是一个纯前端的微信公众号排版工具，将 Markdown 一键转换为可直接粘贴进公众号编辑器的 HTML。
          所有样式内联、文字用 <code class="rounded bg-gray-100 px-1 text-xs">&lt;span leaf=""&gt;</code> 包裹，粘贴后格式不丢。
        </p>

        <!-- 链接区 -->
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="w-20 shrink-0 text-xs text-gray-400">本项目</span>
            <a
              :href="projectGithub"
              target="_blank"
              class="text-emerald-600 hover:underline"
            >
              {{ projectGithub }}
            </a>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-20 shrink-0 text-xs text-gray-400">原 Skill</span>
            <a
              :href="skillGithub"
              target="_blank"
              class="text-emerald-600 hover:underline"
            >
              {{ skillGithub }}
            </a>
          </div>
        </div>

        <!-- 关系说明 -->
        <div class="rounded-lg bg-gray-50 p-4">
          <p class="mb-2 font-medium text-gray-700">与原 Skill 的关系</p>
          <p class="leading-relaxed">
            本项目参考了
            <a :href="skillGithub" target="_blank" class="text-emerald-600 hover:underline">gzh-design-skill</a>
            的设计理念与组件库架构，将其从 AI Agent Skill 转化为纯前端 Web 应用。
          </p>
          <p class="mt-2 leading-relaxed">
            原 Skill 的排版逻辑、6 套主题设计、公众号平台限制兜底方案由
            <strong>甲木 × 摸鱼小李</strong> 联名共建。本项目在此基础上用 Vue 3 + TypeScript 重新实现，
            沿用了原 Skill 的全内联样式、<code class="rounded bg-gray-200 px-1 text-xs">span leaf</code> 包裹、
            双关卡合规校验、AI 增强（关键词下划线 / 封面文案 / 主题推荐）等核心特性，并新增了浏览器端一键复制。
          </p>
        </div>

        <!-- 技术栈 -->
        <div class="flex flex-wrap gap-2">
          <span class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">Vue 3</span>
          <span class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">TypeScript</span>
          <span class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">Vite</span>
          <span class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">Tailwind CSS</span>
          <span class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">markdown-it</span>
          <span class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">Pinia</span>
        </div>
      </div>
    </div>
  </div>
</template>
