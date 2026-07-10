<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore, LLM_PRESETS } from '../stores/settings'
import { testLLMConnection } from '../ai/llm'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ close: [] }>()

const settings = useSettingsStore()
const testing = ref(false)
const testResult = ref<{ status: 'none' | 'success' | 'fail'; error?: string }>({ status: 'none' })

// 本地编辑副本（仅 LLM 配置，显示设置和署名即时生效不需要副本）
const localConfig = ref({ ...settings.llmConfig })

// 署名本地副本（输入时实时同步到 store）
const localAuthorName = ref(settings.authorName)
const localAuthorBio = ref(settings.authorBio)

function onAuthorInput() {
  settings.updateAuthor(localAuthorName.value, localAuthorBio.value)
}

function selectPreset(presetLabel: string) {
  const preset = LLM_PRESETS.find((p) => p.label === presetLabel)
  if (preset) {
    localConfig.value = {
      ...localConfig.value,
      provider: preset.provider,
      baseURL: preset.baseURL,
      model: preset.model,
    }
  }
}

function save() {
  settings.updateConfig(localConfig.value)
  emit('close')
}

async function test() {
  testing.value = true
  testResult.value = { status: 'none' }
  try {
    const result = await testLLMConnection(localConfig.value)
    testResult.value = result.success
      ? { status: 'success' }
      : { status: 'fail', error: result.error }
  } catch (err) {
    testResult.value = { status: 'fail', error: err instanceof Error ? err.message : String(err) }
  } finally {
    testing.value = false
  }
}

function close() {
  emit('close')
}
</script>

<template>
  <!-- 遮罩层 -->
  <Transition name="fade">
    <div
      v-if="props.visible"
      class="fixed inset-0 z-50 bg-black/40"
      @click="close"
    />
  </Transition>

  <!-- 右侧边栏 -->
  <Transition name="slide-right">
    <aside
      v-if="props.visible"
      class="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
    >
      <!-- 头部 -->
      <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 class="text-lg font-bold text-gray-800">设置</h2>
        <button
          @click="close"
          class="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 可滚动内容区 -->
      <div class="flex-1 overflow-y-auto px-6 py-4">
        <!-- 显示设置 -->
        <section class="mb-6">
          <h3 class="mb-3 text-sm font-bold text-gray-700">显示设置</h3>
          <div class="space-y-3">
            <!-- 封面 -->
            <div class="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <div>
                <div class="text-sm font-medium text-gray-700">显示封面</div>
                <div class="text-xs text-gray-400">文章顶部的封面卡片</div>
              </div>
              <button
                @click="settings.toggleCover()"
                class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
                :class="settings.showCover ? 'bg-emerald-600' : 'bg-gray-300'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="settings.showCover ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>

            <!-- 目录 -->
            <div class="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <div>
                <div class="text-sm font-medium text-gray-700">显示目录</div>
                <div class="text-xs text-gray-400">列出全部章节，可横向滚动浏览</div>
              </div>
              <button
                @click="settings.toggleToc()"
                class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
                :class="settings.showToc ? 'bg-emerald-600' : 'bg-gray-300'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="settings.showToc ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>
          </div>
        </section>

        <!-- 分隔线 -->
        <hr class="my-6 border-gray-200" />

        <!-- 署名设置 -->
        <section class="mb-6">
          <h3 class="mb-3 text-sm font-bold text-gray-700">文章署名</h3>
          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-600">作者名</label>
              <input
                v-model="localAuthorName"
                @input="onAuthorInput"
                type="text"
                placeholder="如：diyun"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-600">一句话简介</label>
              <input
                v-model="localAuthorBio"
                @input="onAuthorInput"
                type="text"
                placeholder="如：热衷于分享 AI 观察与干货"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <p class="mt-1 text-xs text-gray-400">署名设置后会自动保存，多篇文章复用</p>
            </div>
          </div>
        </section>

        <!-- 分隔线 -->
        <hr class="my-6 border-gray-200" />

        <!-- LLM 配置 -->
        <section>
          <h3 class="mb-3 text-sm font-bold text-gray-700">LLM 配置</h3>
          <div class="space-y-4">
            <!-- 预设提供商 -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-600">提供商</label>
              <select
                :value="LLM_PRESETS.find((p) => p.provider === localConfig.provider)?.label || '自定义'"
                @change="(e) => selectPreset((e.target as HTMLSelectElement).value)"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option v-for="preset in LLM_PRESETS" :key="preset.label" :value="preset.label">
                  {{ preset.label }}
                </option>
              </select>
            </div>

            <!-- API Base URL -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-600">API Base URL</label>
              <input
                v-model="localConfig.baseURL"
                type="text"
                placeholder="https://api.deepseek.com/v1"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <!-- API Key -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-600">API Key</label>
              <input
                v-model="localConfig.apiKey"
                type="password"
                placeholder="sk-..."
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <p class="mt-1 text-xs text-gray-400">密钥仅存储在浏览器 localStorage，不会上传到任何服务器</p>
            </div>

            <!-- 模型 -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-600">模型名称</label>
              <input
                v-model="localConfig.model"
                type="text"
                placeholder="deepseek-v4-flash"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <!-- Temperature -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-600">
                Temperature: {{ localConfig.temperature.toFixed(1) }}
              </label>
              <input
                v-model.number="localConfig.temperature"
                type="range"
                min="0"
                max="1"
                step="0.1"
                class="w-full"
              />
            </div>

            <!-- 测试结果 -->
            <div v-if="testResult.status !== 'none'" class="text-sm">
              <div v-if="testResult.status === 'success'" class="text-emerald-600">✓ 连接成功</div>
              <div v-else class="text-red-500">
                <div>✗ 连接失败</div>
                <div v-if="testResult.error" class="mt-1 text-xs text-red-400">{{ testResult.error }}</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- 底部操作按钮（仅 LLM 配置需要保存） -->
      <div class="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
        <button
          @click="test"
          :disabled="testing"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          {{ testing ? '测试中...' : '测试连接' }}
        </button>
        <button
          @click="save"
          class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          保存
        </button>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
