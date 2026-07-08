/**
 * md2html - 公众号排版工具
 * Copyright (C) 2026 diyun <diyun@diyun.site>
 * Licensed under AGPL-3.0-or-later. See LICENSE for full text.
 * Based on gzh-design-skill by 甲木 × 摸鱼小李
 * https://github.com/isjiamu/gzh-design-skill
 */

import type { DesignVars, ThemeComponents, ThemeConfig } from '../core/types'
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

    // 删除线
    delMark: (html: string) =>
      `<span style="text-decoration:line-through;color:${v.mutedText};">${html}</span>`,

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
  }
}
