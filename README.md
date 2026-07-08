<div align="center">

# md2html · 公众号排版工具

**把 Markdown 一键排成可直接粘贴进微信公众号编辑器的精致 HTML**

6 套精选主题 · AI 智能排版 · 合规校验 · 纯前端 · 一键复制

</div>

---

## 参考说明

> 本项目基于 [gzh-design-skill](https://github.com/isjiamu/gzh-design-skill) 构建。

[gzh-design-skill](https://github.com/isjiamu/gzh-design-skill) 是一个给 AI Agent（Claude Code / Codex / Cursor 等）用的公众号排版 Skill，由 **甲木 × 摸鱼小李** 联名共建。其排版逻辑、6 套主题设计、公众号平台限制兜底方案凝聚了两人的公众号排版实践。

本项目将其从 AI Agent Skill 转化为**纯前端 Web 应用**，用 Vue 3 + TypeScript 重新实现，沿用了原 Skill 的全内联样式、`<span leaf="">` 包裹、合规校验、AI 增强（关键词下划线 / 封面文案 / 主题推荐）等核心特性，并新增了浏览器端一键复制。

🤝 特别感谢甲木和摸鱼小李的开源贡献，没有 gzh-design-skill 就没有这个项目。

---

## 简介

md2html 是一个**纯前端**的微信公众号排版工具。你写完 Markdown，它按你选的主题，生成**样式全内联、粘贴到公众号编辑器不掉格式**的 HTML——自动编章节号、标关键词下划线、配引言卡与目录、处理代码块和图片，并用确定性校验兜住公众号平台的各种限制。

### 核心特性

- **6 套精选主题**：摸鱼绿（默认）· 红白色系 · 石墨极简 · 留白禅意 · 摸鱼票据 · 橄榄手记——每套都是自成体系的组件库（设计变量 + 封面/引言卡/章节标题/签名等专属组件）。
- **AI 智能排版**：接入 LLM 自动标记关键词下划线、生成封面文案、推荐主题、提取引言卡——单次调用完成全部增强。
- **合规校验**：确定性检查公众号平台禁用标签/属性/CSS（`<style>`/`<script>`/`<div>`/`class`/`position:fixed`/`float`/`grid` 等），确保 `<span leaf="">` 包裹完整。
- **纯前端运行**：无后端，所有逻辑在浏览器中执行，LLM API Key 存 localStorage，不上传任何服务器。
- **一键复制**：点一下把富文本复制到剪贴板，直接粘进公众号编辑器。
- **全角标点**：正文自动规范全角标点，代码块内原样保留。

## AI 增强：开启 vs 关闭

| | AI 增强开启 | AI 增强关闭 |
|---|---|---|
| **关键词下划线** | LLM 逐段分析，每段标记 1-3 个核心短语加下划线（最高频特色） | 不标记下划线 |
| **封面文案** | LLM 根据文章内容生成杂志风封面（划线旧认知 + 主标题 + 高亮词 + 副标题） | 使用文章标题生成简单封面 |
| **章节英文标签** | LLM 据中文章节标题生成语义化英文标签（如 TUTORIAL / SUMMARY） | 使用内置关键词词典匹配，无匹配时显示 SECTION |
| **引言卡** | LLM 从正文提炼一句精华引言 + 作者署名 | 从文章开头的引用块提取，无引用块则跳过 |
| **主题推荐** | LLM 分析文章题材自动推荐最契合的主题 | 手动选择主题 |
| **文章类型判定** | LLM 判定文章类型（教程/测评/观点/案例等） | 不判定 |
| **API 成本** | 需要配置 LLM API Key，产生 API 调用费用 | 零成本 |
| **响应速度** | 需等待 LLM 响应（几秒到十几秒） | 秒级完成 |

> **简单来说**：关闭 AI 增强 = 纯规则排版引擎，速度快、零成本，但缺少关键词下划线和智能封面；开启 AI 增强 = 接近原 skill 的完整排版效果。

## 快速开始

首先克隆本项目：

```bash
git clone https://github.com/demoj/md2html.git
cd md2html
```


### 本地开发

```bash
npm install
npm run dev
# 打开 http://localhost:5173
```

### Docker 部署

```bash
# 方式一：docker compose（推荐）
docker compose up -d
# 访问 http://localhost:8080

# 方式二：docker 原生命令
docker build -t md2html .
docker run -d -p 8080:80 md2html
```

Docker 镜像采用两阶段构建（Node 编译 → nginx 提供静态服务），最终镜像约 30MB。

### 构建静态文件

```bash
npm run build
# 产物在 dist/ 目录，可直接部署到任何静态托管平台
# 如 GitHub Pages / Vercel / Netlify / Cloudflare Pages
```

## 使用流程

1. **配置 LLM**（可选）：点击右上角齿轮图标，选择 LLM 提供商（DeepSeek / OpenAI / 通义千问 / Kimi / 智谱等），填入 API Key。
2. **写 Markdown**：在左侧编辑器输入 Markdown 内容。
3. **选主题**：从下拉框选择排版主题。
4. **排版**：点击底部「排版」按钮，生成公众号 HTML。
5. **复制**：点击预览区右上角「复制到公众号」，粘贴到公众号编辑器即可。

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Vue 3 + TypeScript |
| 构建 | Vite 6 |
| Markdown 解析 | markdown-it（自定义 ==高亮== / ++下划线++ 语法） |
| 状态管理 | Pinia |
| UI 样式 | Tailwind CSS |
| LLM 调用 | 原生 fetch（OpenAI 兼容协议） |
| 部署 | nginx（Docker）/ 静态托管 |

## 项目结构

```
md2html/
├── src/
│   ├── core/               # 核心引擎
│   │   ├── types.ts        # 类型系统（AST / 主题 / AI / 校验）
│   │   ├── parser.ts       # Markdown → AST 解析器
│   │   ├── generator.ts    # AST + 主题 + AI → 公众号 HTML
│   │   ├── transform.ts    # 全角标点 / span 包裹 / 章节编号 / 关键词下划线
│   │   └── validator.ts    # 合规校验（标签 + CSS 属性分级检查）
│   ├── ai/                 # AI 增强层
│   │   ├── llm.ts          # LLM 调用抽象（OpenAI 兼容）
│   │   ├── prompts.ts      # 增强提示词
│   │   └── enhance.ts      # 编排（关键词 / 标签 / 引言 / 封面）
│   ├── themes/             # 主题系统
│   │   ├── base.ts         # 基类工厂（通用组件按设计变量生成）
│   │   ├── moyu-green.ts   # 摸鱼绿
│   │   ├── red-white.ts    # 红白色系
│   │   ├── graphite-minimal.ts # 石墨极简风
│   │   ├── zen-whitespace.ts   # 留白禅意风
│   │   ├── moyu-ticket.ts  # 摸鱼票据风
│   │   ├── olive-journal.ts # 橄榄手记
│   │   └── index.ts        # 主题注册
│   ├── stores/             # Pinia 状态
│   │   ├── settings.ts     # LLM 配置（存 localStorage）
│   │   └── editor.ts       # 编辑器状态 + 排版主流程
│   └── components/         # Vue 组件
│       ├── MarkdownEditor.vue
│       ├── ThemePicker.vue
│       ├── PreviewPanel.vue
│       ├── SettingsModal.vue
│       └── AboutModal.vue
├── Dockerfile              # Docker 两阶段构建
├── nginx.conf              # Nginx 静态服务配置
├── docker-compose.yml      # Docker Compose 编排
└── package.json
```

## 6 套主题速查

| 主题 | 主色 | 适合 |
|---|---|---|
| **摸鱼绿**（默认） | `#059669` emerald | 教程、测评、清单、工具盘点 |
| **红白色系** | `#DC2626` 正红 | 深度分析、观点、力量感话题 |
| **石墨极简风** | `#52525B` 石墨灰 | 设计、科技评论、专业观点 |
| **留白禅意风** | `#4A5D52` 墨绿 | 禅意、极简生活、深度随笔 |
| **摸鱼票据风** | `#059669` emerald | 工具对比、创意评测 |
| **橄榄手记** | `#1e1f23` 墨黑 + `#ed7b2f` 橙 | 内刊手记、深度评测、案例复盘 |


## 致谢

感谢 [linuxdo](https://linux.do/) 社区的交流、分享与反馈。

## License

**GNU AGPL-3.0 © 2026 diyun**

本项目采用 [GNU AGPL-3.0-or-later](LICENSE) 协议，与原 [gzh-design-skill](https://github.com/isjiamu/gzh-design-skill)（AGPL-3.0 © 2026 甲木 × 摸鱼小李）保持一致，要点：

1. **必须署名** — 保留版权声明与原作者署名
2. **衍生品必须开源** — 任何修改版本、Fork、二次分发，必须以 AGPL-3.0 公开发布，提供完整源代码
3. **网络服务也要开源** — 即使只部署成 SaaS / Web 服务给别人用，也要公开源代码（AGPL 区别于 GPL 的核心）
4. **不允许闭源商业化** — 不允许闭源、专有化、仅付费分发

---

<div align="center">

[原 Skill 项目](https://github.com/isjiamu/gzh-design-skill) ｜ 纯前端 · 开源 · AGPL-3.0

</div>
