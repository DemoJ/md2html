/**
 * md2html - 公众号排版工具
 * Copyright (C) 2026 diyun <diyun@diyun.site>
 * Licensed under AGPL-3.0-or-later. See LICENSE for full text.
 * Based on gzh-design-skill by 甲木 × 摸鱼小李
 * https://github.com/isjiamu/gzh-design-skill
 */

import type { DesignVars, ThemeComponents, ThemeConfig, TocItem } from '../core/types'
import { toFullWidthPunctuation, wrapLeaf, escapeHtml } from '../core/transform'

/**
 * 主题基类工厂
 * 根据设计变量生成通用组件（代码块、图片、行内元素等），
 * 各主题可在此基础上覆盖特定组件（封面、引言卡、章节标题等）
 */
export function createBaseComponents(v: DesignVars): Partial<ThemeComponents> {
  return {
    // 全局容器
    globalContainer: (children: string) =>
      `<section style="max-width:677px;margin:0 auto;background:#ffffff;font-family:${v.fontFamily};color:${v.bodyColor};line-height:1.75;letter-spacing:0.5px;overflow-x:hidden;">${children}</section>`,

    // 正文段落
    bodyParagraph: (html: string) =>
      `<p style="margin:0 0 18px;font-size:${v.bodyFontSize};line-height:${v.bodyLineHeight};color:${v.bodyColor};letter-spacing:0.5px;">${html}</p>`,

    // 主色加粗
    boldPrimary: (html: string) =>
      `<strong style="color:${v.primary};font-weight:700;">${html}</strong>`,

    // 高亮标记（渐变背景）
    highlightMark: (html: string) =>
      `<span style="background:linear-gradient(transparent 60%,${v.highlight} 60%);font-weight:600;">${html}</span>`,

    // 下划线标记
    underlineMark: (html: string) =>
      `<span style="border-bottom:2px solid ${v.lightBorder};font-weight:600;">${html}</span>`,

    // 删除线 → 荧光笔（底部半高亮，按 skill 规范）
    delMark: (html: string) =>
      `<span style="background:linear-gradient(transparent 60%,${v.highlight} 60%);">${html}</span>`,

    // 引用块
    quoteBlock: (html: string) =>
      `<section style="margin:0 0 20px;background:${v.lightBg};border-radius:0 10px 10px 0;border-left:4px solid ${v.primary};padding:16px 20px;"><p style="font-size:${v.bodyFontSize};color:${v.secondaryText};margin:0;line-height:1.8;">${html}</p></section>`,

    // 深色代码块
    codeBlockDark: (lang: string, lines: string[]) => {
      const langLabel = lang
        ? `<span style="margin-left:12px;font-size:12px;color:#64748B;font-family:Consolas,Monaco,monospace;letter-spacing:1px;">${wrapLeaf(escapeHtml(lang))}</span>`
        : ''
      const codeLines = lines
        .map(
          (line) =>
            `<p style="margin:0;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:13px;line-height:1.6;color:#E2E8F0;">${wrapLeaf(escapeHtml(line))}</p>`
        )
        .join('')
      return `<section style="margin:0 0 20px;border-radius:8px;overflow:hidden;background:#1E293B;box-shadow:0 4px 16px -8px rgba(15,23,42,0.4);"><section style="display:flex;align-items:center;padding:9px 14px;background:#0F172A;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FF5F56;margin-right:7px;font-size:0;line-height:0;overflow:hidden;">.</span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FFBD2E;margin-right:7px;font-size:0;line-height:0;overflow:hidden;">.</span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#27C93F;font-size:0;line-height:0;overflow:hidden;">.</span>${langLabel}</section><section style="padding:11px 14px;">${codeLines}</section></section>`
    },

    // 浅色代码块
    codeBlockLight: (lang: string, lines: string[]) => {
      const langLabel = lang
        ? `<span style="font-size:12px;color:${v.mutedText};font-family:Consolas,Monaco,monospace;letter-spacing:1px;">${wrapLeaf(escapeHtml(lang))}</span>`
        : ''
      const codeLines = lines
        .map(
          (line) =>
            `<p style="margin:0;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:13px;line-height:1.6;color:#24292F;">${wrapLeaf(escapeHtml(line))}</p>`
        )
        .join('')
      return `<section style="margin:0 0 20px;border-radius:8px;overflow:hidden;background:#F6F8FA;border:1px solid ${v.borderColor};border-left:3px solid ${v.primary};"><section style="padding:7px 14px;border-bottom:1px solid ${v.borderColor};">${langLabel}</section><section style="padding:11px 14px;">${codeLines}</section></section>`
    },

    // 行内代码
    inlineCode: (code: string) =>
      `<span style="background:${v.lightGrayBg};color:${v.primary};padding:1px 6px;border-radius:4px;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:13px;">${wrapLeaf(code)}</span>`,

    // 标准图片
    image: (src: string, alt: string) => {
      const img = `<span leaf=""><img src="${src}" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span>`
      const caption = alt
        ? `<p style="font-size:12px;color:${v.mutedText};text-align:center;margin:0 0 24px;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(`— ${alt}`)))}</p>`
        : ''
      return `<section style="background:#FFF;border-radius:12px;padding:6px;border:1px solid ${v.borderColor};box-shadow:0 4px 12px -2px rgba(0,0,0,0.08);margin-bottom:8px;"><section style="margin:0;border-radius:8px;overflow:hidden;">${img}</section></section>${caption}`
    },

    // GIF 动图
    gifImage: (src: string, alt: string) => {
      const img = `<span leaf=""><img src="${src}" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span>`
      const badge = `<span style="display:inline-block;background:${v.lightBg};color:${v.primary};font-size:11px;font-weight:700;padding:1px 8px;border-radius:4px;margin-right:6px;">${wrapLeaf('GIF 动图')}</span>`
      const caption = alt
        ? `<span style="font-size:12px;color:${v.mutedText};">${wrapLeaf(escapeHtml(alt))}</span>`
        : ''
      return `<section style="background:#FFF;border-radius:12px;padding:6px;border:1px solid ${v.borderColor};box-shadow:0 4px 12px -2px rgba(0,0,0,0.08);margin-bottom:8px;"><section style="margin:0;border-radius:8px;overflow:hidden;">${img}</section></section><p style="text-align:center;margin:0 0 24px;">${badge}${caption}</p>`
    },

    // 待补素材占位
    placeholder: (text: string) =>
      `<section style="margin:0 0 24px;padding:30px 20px;border:1.5px dashed #DAD7D2;border-radius:14px;background:#FAFAF8;text-align:center;"><p style="margin:0 0 10px;font-size:26px;line-height:1;">${wrapLeaf('🎬')}</p><p style="margin:0;font-size:14px;font-weight:700;color:${v.mutedText};letter-spacing:1px;">${wrapLeaf('待补素材')}</p><p style="margin:8px 0 0;font-size:13px;color:#B8B5B0;line-height:1.7;">${wrapLeaf(escapeHtml(text))}</p></section>`,

    // 左竖条小标题
    leftBarTitle: (text: string) =>
      `<p style="margin:28px 0 14px;font-size:16px;font-weight:800;color:${v.titleColor};line-height:1.5;border-left:4px solid ${v.primary};padding-left:12px;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(text)))}</p>`,

    // 药丸标签小标题
    pillTitle: (text: string) =>
      `<p style="margin:28px 0 14px;"><span style="display:inline-block;background:${v.primary};color:#FFFFFF;font-size:14px;font-weight:700;padding:5px 16px;border-radius:6px;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(text)))}</span></p>`,

    // 序号药丸 + 标题
    numberedTitle: (num: string, text: string) =>
      `<p style="margin:24px 0 12px;font-size:15px;font-weight:800;color:${v.titleColor};line-height:1.6;"><span style="display:inline-block;background:${v.lightBg};color:${v.primary};border-radius:5px;padding:1px 9px;margin-right:8px;font-weight:900;">${wrapLeaf(num)}</span>${wrapLeaf(escapeHtml(toFullWidthPunctuation(text)))}</p>`,

    // 金句引用（左竖条版）
    goldQuote: (text: string) =>
      `<section style="margin:0 0 24px;background:${v.lightBg};border-radius:0 10px 10px 0;border-left:4px solid ${v.primary};padding:16px 20px;"><p style="font-size:16px;font-weight:800;color:${v.primary};margin:0;line-height:1.8;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(text)))}</p></section>`,

    // 提示/旁注块
    tipBlock: (label: string, text: string) =>
      `<section style="margin:0 0 24px;background:${v.lightBg};border-radius:0 8px 8px 0;border-left:4px solid ${v.primary};padding:14px 18px;"><p style="margin:0 0 6px;"><span style="display:inline-block;background:${v.primary};color:#FFFFFF;font-size:11px;font-weight:700;padding:2px 10px;border-radius:4px;letter-spacing:1px;">${wrapLeaf(escapeHtml(label))}</span></p><p style="font-size:14px;color:${v.secondaryText};margin:0;line-height:1.8;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(text)))}</p></section>`,

    // 分割线
    hr: () =>
      `<section style="margin:28px 0;border:none;border-top:1px solid ${v.borderColor};"><span leaf=""><br></span></section>`,

    // 列表项
    listItem: (html: string, ordered: boolean, index: number) => {
      const marker = ordered
        ? `<span style="color:${v.primary};font-weight:700;margin-right:6px;">${wrapLeaf(`${index + 1}.`)}</span>`
        : `<span style="color:${v.primary};margin-right:8px;">${wrapLeaf('•')}</span>`
      return `<p style="margin:0 0 8px;font-size:${v.bodyFontSize};line-height:${v.bodyLineHeight};color:${v.bodyColor};display:flex;align-items:flex-start;">${marker}<span style="flex:1;">${html}</span></p>`
    },

    // 目录（skill toc-scroll：横向滚动，列出所有章节，最后固定「写在最后」卡）
    toc: (items: TocItem[], conclusionMarker: string) => {
      const total = items.length + 1
      const card = (partLabel: string, title: string, highlighted: boolean) => {
        const bg = highlighted ? `linear-gradient(135deg,${v.primary},${v.secondary || v.primary})` : '#fff'
        const numColor = highlighted ? 'rgba(255,255,255,0.75)' : v.mutedText
        const titleColor = highlighted ? '#fff' : v.titleColor
        const border = highlighted ? 'border:none;' : `border:1px solid ${v.borderColor};box-shadow:0 2px 6px rgba(0,0,0,0.04);`
        return `<section style="display:inline-block;white-space:normal;vertical-align:top;width:110px;background:${bg};${border}border-radius:12px;padding:12px;margin-right:8px;">
  <p style="font-size:9px;font-weight:700;letter-spacing:1px;margin:0 0 5px;color:${numColor};"><span leaf="">PART ${partLabel}</span></p>
  <p style="font-size:13px;font-weight:800;margin:0;line-height:1.4;color:${titleColor};"><span leaf="">${escapeHtml(toFullWidthPunctuation(title))}</span></p>
</section>`
      }
      const cards = items
        .map((item, i) => card(String(i + 1).padStart(2, '0'), item.title, i === 0))
        .join('')
      const last = card(conclusionMarker, '写在最后', false)
      return `<section style="margin:0 0 32px;">
  <section style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
    <p style="font-size:10px;color:${v.mutedText};margin:0;text-transform:uppercase;letter-spacing:2px;font-weight:600;"><span leaf="">📦 ${total} Parts + Conclusion</span></p>
    <p style="font-size:10px;color:${v.mutedText};margin:0;"><span leaf="">👉 滑动</span></p>
  </section>
  <section style="overflow-x:scroll;-webkit-overflow-scrolling:touch;white-space:nowrap;padding-bottom:8px;">
    ${cards}${last}
  </section>
</section>`
    },

    // 引言卡（skill oneliner-card：虚线框 + 居中 + 关键句黄色下划线高亮）
    introCard: (data) => {
      const inner = data.highlightAll
        ? `<span style="font-size:15px;color:${v.secondaryText};font-weight:bold;border-bottom:3px solid ${v.highlight};padding-bottom:2px;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(data.text)))}</span>`
        : `<span style="font-size:15px;color:${v.secondaryText};">${wrapLeaf(escapeHtml(toFullWidthPunctuation(data.text)))}</span>`
      const author = data.author
        ? `<p style="text-align:right;font-size:13px;color:${v.mutedText};margin:12px 0 0;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(`—— ${data.author}`)))}</p>`
        : ''
      return `<section style="margin:0 0 28px;background:#FFF;border:1px dashed ${v.lightBorderSoft};border-radius:8px;padding:14px 16px;text-align:center;"><p style="margin:0;line-height:1.6;">${inner}</p>${author}</section>`
    },

    // 互动三连按钮卡（skill footer-cta：点赞/在看/转发 + THANKS FOR READING，主题色）
    footerCta: () => {
      const icon = (d: string) =>
        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`
      const like = '<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>'
      const eye = '<circle cx="12" cy="12" r="3"></circle><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>'
      const share = '<path d="M4 18v-4a8 8 0 0 1 8-8h8"></path><polyline points="16 2 20 6 16 10"></polyline>'
      const btn = (svgPath: string, label: string, accent: boolean) =>
        `<section style="text-align:center;color:${accent ? v.primary : v.secondaryText};">
          <section style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;background:${accent ? v.lightBg : '#fff'};border-radius:12px;box-shadow:0 2px 4px rgba(0,0,0,0.05);border:1px solid ${accent ? v.lightBorder : v.lightGrayBg};">${icon(svgPath)}</section>
          <span style="font-size:10px;font-weight:600;">${wrapLeaf(label)}</span>
        </section>`
      return `<section style="margin:0 0 24px;background:radial-gradient(circle at center,${v.lightBg} 0%,#FFFFFF 100%);border:1px solid ${v.borderColor};border-radius:16px;padding:32px 20px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
        <section style="display:flex;justify-content:center;gap:24px;margin-bottom:16px;">
          ${btn(like, '点赞', false)}
          ${btn(eye, '在看', false)}
          ${btn(share, '转发', true)}
        </section>
        <p style="font-size:10px;color:${v.mutedText};letter-spacing:1px;margin:0;">${wrapLeaf('THANKS FOR READING')}</p>
      </section>`
    },
  }
}

/**
 * 合并基类组件和主题专属组件
 */
export function mergeTheme(
  base: Partial<ThemeComponents>,
  overrides: Partial<ThemeComponents>
): ThemeComponents {
  return { ...base, ...overrides } as ThemeComponents
}

/**
 * 创建主题配置的辅助函数
 */
export function createTheme(config: {
  id: string
  name: string
  primary: string
  underlineCSS: string
  description: string
  suitableFor: string
  designVars: DesignVars
  components: Partial<ThemeComponents>
  skeleton?: string[]
  recipe?: Record<string, string[]>
  mapping?: Record<string, string>
  conclusionMarker?: string
  codeStyle?: 'dark' | 'light'
}): ThemeConfig {
  const baseComponents = createBaseComponents(config.designVars)
  return {
    id: config.id,
    name: config.name,
    primary: config.primary,
    underlineCSS: config.underlineCSS,
    description: config.description,
    suitableFor: config.suitableFor,
    designVars: config.designVars,
    components: mergeTheme(baseComponents, config.components),
    skeleton: config.skeleton || ['cover', 'introCard', 'toc', 'chapters', 'signature'],
    recipe: config.recipe || {},
    mapping: config.mapping || {},
    conclusionMarker: config.conclusionMarker,
    codeStyle: config.codeStyle,
  }
}
