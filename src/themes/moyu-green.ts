/**
 * md2html - 公众号排版工具
 * Copyright (C) 2026 diyun <diyun@diyun.site>
 * Licensed under AGPL-3.0-or-later. See LICENSE for full text.
 * Based on gzh-design-skill by 甲木 × 摸鱼小李
 * https://github.com/isjiamu/gzh-design-skill
 */

import type { DesignVars } from '../core/types'
import { toFullWidthPunctuation, wrapLeaf, escapeHtml } from '../core/transform'
import { createTheme } from './base'

const designVars: DesignVars = {
  primary: '#059669',
  secondary: '#10B981',
  lightBg: '#ECFDF5',
  lightBorder: '#A7F3D0',
  lightBorderSoft: '#BBF7D0',
  highlight: '#FDE68A',
  highlightBg: '#FFFBEB',
  titleColor: '#111827',
  bodyColor: '#374151',
  secondaryText: '#4B5563',
  mutedText: '#9CA3AF',
  borderColor: '#E5E7EB',
  lightGrayBg: '#F3F4F6',
  bodyFontSize: '14px',
  bodyLineHeight: '1.9',
  fontFamily: `-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif`,
}

export const moyuGreen = createTheme({
  id: 'moyu-green',
  name: '摸鱼绿',
  primary: '#059669',
  underlineCSS: 'border-bottom:2px solid #A7F3D0;font-weight:600;',
  description: '绿色杂志风，卡片丰富、信息密度高',
  suitableFor: '教程、测评、清单、工具盘点',
  designVars,
  components: {
    // 杂志快讯封面（无右图版）
    cover: (data) => {
      const v = designVars
      return `<section style="margin:0 0 32px;background:#fff;border:1.5px solid rgba(5,150,105,0.15);border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);width:100%;">
  <section style="padding:32px 28px 28px;">
    <section style="display:flex;align-items:center;gap:8px;margin-bottom:28px;">
      <span style="width:6px;height:6px;background:${v.primary};border-radius:50%;"><span leaf=""><br></span></span>
      <span style="font-size:11px;font-weight:700;letter-spacing:3px;color:${v.primary};">${wrapLeaf(escapeHtml(data.topTag))}</span>
      <section style="flex:1;height:1px;overflow:hidden;background:linear-gradient(to right,rgba(5,150,105,0.12),transparent);"><span leaf=""><br></span></section>
      <span style="font-size:10px;color:#D1D5DB;font-weight:600;">${wrapLeaf(escapeHtml(data.date))}</span>
    </section>
    <section style="display:flex;align-items:center;gap:20px;">
      <section style="flex:1;min-width:0;">
        <p style="font-size:15px;color:#D1D5DB;margin:0 0 6px;text-decoration:line-through;letter-spacing:0.5px;">${wrapLeaf(escapeHtml(data.oldBelief))}</p>
        <p style="font-size:24px;font-weight:900;color:${v.titleColor};margin:0;line-height:1.05;letter-spacing:-2px;">${wrapLeaf(escapeHtml(data.titleLine1))}<span style="color:${v.primary};">${wrapLeaf(escapeHtml(data.highlightWord))}</span></p>
        <p style="font-size:24px;font-weight:900;color:${v.primary};margin:0 0 16px;line-height:1.05;letter-spacing:-2px;">${wrapLeaf(escapeHtml(data.titleLine2))}</p>
        <section style="width:48px;height:3px;background:linear-gradient(to right,${v.primary},${v.secondary});border-radius:2px;margin-bottom:12px;"><span leaf=""><br></span></section>
        <p style="font-size:13px;color:${v.mutedText};margin:0;line-height:1.7;letter-spacing:0.5px;">${wrapLeaf(escapeHtml(data.subtitle))}</p>
      </section>
    </section>
  </section>
  <section style="background:linear-gradient(135deg,${v.primary},${v.secondary});padding:12px 28px;display:flex;align-items:center;justify-content:space-between;">
    <p style="font-size:12px;color:rgba(255,255,255,0.9);margin:0;font-weight:600;letter-spacing:0.5px;">${wrapLeaf(escapeHtml(data.bottomLeft))}</p>
    <section style="display:flex;gap:4px;">${data.tags.map((t) => `<span style="background:rgba(255,255,255,0.2);padding:1px 6px;border-radius:3px;font-size:8px;color:#fff;font-weight:600;">${wrapLeaf(escapeHtml(t))}</span>`).join('')}</section>
  </section>
</section>`
    },

    // 引言卡
    introCard: (data) => {
      const v = designVars
      const author = data.author
        ? `<p style="text-align:right;font-size:13px;color:${v.mutedText};margin:12px 0 0;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(`—— ${data.author}`)))}</p>`
        : ''
      return `<section style="margin:0 0 28px;background:${v.lightBg};border-radius:14px;padding:24px 28px;border:1px solid ${v.lightBorderSoft};">
  <p style="font-size:15px;color:${v.secondaryText};margin:0;line-height:1.9;letter-spacing:0.3px;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(data.text)))}</p>
  ${author}
</section>`
    },

    // 目录（精选 3 个）
    toc: (items) => {
      const v = designVars
      const tocItems = items
        .map(
          (item) =>
            `<section style="display:flex;align-items:center;gap:10px;margin-bottom:10px;"><span style="font-size:12px;font-weight:900;color:${v.primary};min-width:24px;">${wrapLeaf(escapeHtml(item.num))}</span><span style="font-size:13px;color:${v.secondaryText};line-height:1.6;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(item.title)))}</span></section>`
        )
        .join('')
      return `<section style="margin:0 0 28px;background:#FAFAFA;border-radius:12px;padding:20px 24px;border:1px solid ${v.borderColor};">
  <p style="font-size:12px;font-weight:700;color:${v.mutedText};letter-spacing:2px;margin:0 0 14px;">${wrapLeaf('本文看点')}</p>
  ${tocItems}
</section>`
    },

    // 章节标题
    chapterTitle: (data) => {
      const v = designVars
      return `<section style="margin:36px 0 20px;">
  <section style="display:flex;align-items:baseline;gap:10px;margin-bottom:8px;">
    <span style="font-size:28px;font-weight:900;color:${v.primary};line-height:1;letter-spacing:-1px;">${wrapLeaf(escapeHtml(data.num))}</span>
    <span style="font-size:11px;font-weight:700;color:${v.mutedText};letter-spacing:2px;text-transform:uppercase;">${wrapLeaf(escapeHtml(data.enLabel))}</span>
  </section>
  <p style="font-size:18px;font-weight:800;color:${v.titleColor};margin:0;line-height:1.4;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(data.title)))}</p>
  <section style="width:36px;height:3px;background:linear-gradient(to right,${v.primary},${v.secondary});border-radius:2px;margin-top:10px;"><span leaf=""><br></span></section>
</section>`
    },

    // 作者签名区
    signature: (data) => {
      const v = designVars
      return `<section style="margin:40px 0 0;padding:28px 24px;background:${v.lightBg};border-radius:14px;text-align:center;">
  <section style="width:40px;height:3px;background:linear-gradient(to right,${v.primary},${v.secondary});border-radius:2px;margin:0 auto 16px;"><span leaf=""><br></span></section>
  <p style="font-size:14px;color:${v.secondaryText};margin:0 0 8px;line-height:1.8;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(`我是${data.author}，${data.bio}`)))}</p>
  <p style="font-size:13px;color:${v.mutedText};margin:0;line-height:1.8;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(data.cta)))}</p>
</section>`
    },
  },
  skeleton: ['cover', 'introCard', 'toc', 'chapters', 'signature'],
  recipe: {
    教程: ['cover', 'introCard', 'toc', 'chapterTitle', 'leftBarTitle', 'codeBlockDark', 'tipBlock', 'signature'],
    测评: ['cover', 'introCard', 'toc', 'chapterTitle', 'numberedTitle', 'goldQuote', 'signature'],
    盘点: ['cover', 'introCard', 'toc', 'chapterTitle', 'numberedTitle', 'signature'],
    观点: ['cover', 'introCard', 'toc', 'chapterTitle', 'goldQuote', 'quoteBlock', 'signature'],
  },
  mapping: {
    'heading_1': 'cover',
    'heading_2': 'chapterTitle',
    'heading_3': 'leftBarTitle',
    'paragraph': 'bodyParagraph',
    'blockquote': 'quoteBlock',
    'code_block': 'codeBlockDark',
    'image': 'image',
    'hr': 'hr',
    'list': 'listItem',
  },
})
