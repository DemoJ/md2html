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
  bodyLineHeight: '1.85',
  fontFamily: `-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif`,
}

export const moyuTicket = createTheme({
  id: 'moyu-ticket',
  name: '摸鱼票据风',
  primary: '#059669',
  underlineCSS: 'border-bottom:2px solid #A7F3D0;font-weight:600;',
  description: '票据/门票视觉隐喻，硬阴影卡片+编号+虚线撕裂边',
  suitableFor: '工具对比、创意评测、产品盘点',
  designVars,
  codeStyle: 'dark',
  components: {
    cover: (data) => {
      const v = designVars
      return `<section style="margin:0 0 32px;background:#fff;border:2px solid ${v.titleColor};border-radius:12px;overflow:hidden;box-shadow:4px 4px 0 ${v.titleColor};">
  <section style="background:${v.titleColor};padding:6px 20px;display:flex;align-items:center;justify-content:space-between;">
    <span style="font-size:10px;font-weight:800;letter-spacing:2px;color:#fff;text-transform:uppercase;">${wrapLeaf(escapeHtml(data.topTag))}</span>
    <span style="font-size:10px;color:rgba(255,255,255,0.6);font-weight:600;">${wrapLeaf(escapeHtml(data.date))}</span>
  </section>
  <section style="padding:28px 24px 20px;">
    <section style="display:flex;align-items:flex-start;gap:16px;">
      <section style="flex-shrink:0;width:48px;height:48px;background:${v.lightBg};border:2px solid ${v.primary};border-radius:8px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:20px;font-weight:900;color:${v.primary};">${wrapLeaf('★')}</span>
      </section>
      <section style="flex:1;min-width:0;">
        ${data.oldBelief ? `<p style="font-size:13px;color:${v.mutedText};margin:0 0 6px;text-decoration:line-through;">${wrapLeaf(escapeHtml(data.oldBelief))}</p>` : ''}
        <p style="font-size:22px;font-weight:900;color:${v.titleColor};margin:0;line-height:1.15;letter-spacing:-1px;">${wrapLeaf(escapeHtml(data.titleLine1))}<span style="color:${v.primary};">${wrapLeaf(escapeHtml(data.highlightWord))}</span></p>
        ${data.titleLine2 ? `<p style="font-size:22px;font-weight:900;color:${v.primary};margin:0 0 12px;line-height:1.15;letter-spacing:-1px;">${wrapLeaf(escapeHtml(data.titleLine2))}</p>` : ''}
        <p style="font-size:12px;color:${v.mutedText};margin:0;line-height:1.6;">${wrapLeaf(escapeHtml(data.subtitle))}</p>
      </section>
    </section>
  </section>
  <section style="border-top:2px dashed ${v.borderColor};padding:10px 20px;display:flex;align-items:center;justify-content:space-between;background:${v.lightBg};">
    <p style="font-size:11px;color:${v.mutedText};margin:0;font-weight:600;letter-spacing:0.5px;">${wrapLeaf(escapeHtml(data.bottomLeft))}</p>
    <section style="display:flex;gap:4px;">${data.tags.map((t) => `<span style="background:${v.primary};color:#fff;padding:2px 8px;border-radius:3px;font-size:9px;font-weight:800;letter-spacing:0.5px;">${wrapLeaf(escapeHtml(t))}</span>`).join('')}</section>
  </section>
</section>`
    },

    chapterTitle: (data) => {
      const v = designVars
      return `<section style="margin:32px 0 20px;padding:16px 18px;background:#fff;border:1.5px solid ${v.titleColor};border-radius:10px;box-shadow:3px 3px 0 ${v.titleColor};">
  <section style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
    <span style="background:${v.primary};color:#fff;font-size:14px;font-weight:900;padding:3px 10px;border-radius:5px;">${wrapLeaf(escapeHtml(data.num))}</span>
    <span style="font-size:10px;font-weight:700;color:${v.mutedText};letter-spacing:2px;text-transform:uppercase;">${wrapLeaf(escapeHtml(data.enLabel))}</span>
  </section>
  <p style="font-size:17px;font-weight:800;color:${v.titleColor};margin:0;line-height:1.4;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(data.title)))}</p>
</section>`
    },

    signature: (data) => {
      const v = designVars
      return `<section style="margin:36px 0 0;padding:24px 20px;background:${v.lightBg};border:1.5px dashed ${v.primary};border-radius:10px;text-align:center;">
  <p style="font-size:13px;color:${v.secondaryText};margin:0 0 6px;line-height:1.8;font-weight:500;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(`我是${data.author}，${data.bio}`)))}</p>
  <p style="font-size:12px;color:${v.mutedText};margin:0;line-height:1.7;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(data.cta)))}</p>
</section>`
    },
  },
  skeleton: ['cover', 'introCard', 'toc', 'chapters', 'signature'],
  recipe: {
    测评: ['cover', 'introCard', 'toc', 'chapterTitle', 'numberedTitle', 'goldQuote', 'signature'],
    盘点: ['cover', 'introCard', 'toc', 'chapterTitle', 'numberedTitle', 'signature'],
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
