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
  primary: '#DC2626',
  secondary: '#EF4444',
  lightBg: '#FEF2F2',
  lightBorder: '#FECACA',
  lightBorderSoft: '#FEE2E2',
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

export const redWhite = createTheme({
  id: 'red-white',
  name: '红白色系',
  primary: '#DC2626',
  underlineCSS: 'border-bottom:2px solid #FECACA;font-weight:600;',
  description: '经典编辑风，红色克制点睛，编号章节+引言卡+签名区',
  suitableFor: '深度分析、观点、力量感话题',
  designVars,
  components: {
    cover: (data) => {
      const v = designVars
      return `<section style="margin:0 0 32px;background:#fff;border:1px solid ${v.borderColor};border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05);">
  <section style="background:${v.primary};padding:8px 24px;display:flex;align-items:center;justify-content:space-between;">
    <span style="font-size:11px;font-weight:700;letter-spacing:2px;color:#fff;">${wrapLeaf(escapeHtml(data.topTag))}</span>
    <span style="font-size:10px;color:rgba(255,255,255,0.8);font-weight:600;">${wrapLeaf(escapeHtml(data.date))}</span>
  </section>
  <section style="padding:32px 28px 24px;">
    ${data.oldBelief ? `<p style="font-size:14px;color:${v.mutedText};margin:0 0 8px;text-decoration:line-through;">${wrapLeaf(escapeHtml(data.oldBelief))}</p>` : ''}
    <p style="font-size:26px;font-weight:900;color:${v.titleColor};margin:0;line-height:1.15;letter-spacing:-1px;">${wrapLeaf(escapeHtml(data.titleLine1))}<span style="color:${v.primary};">${wrapLeaf(escapeHtml(data.highlightWord))}</span></p>
    ${data.titleLine2 ? `<p style="font-size:26px;font-weight:900;color:${v.primary};margin:0 0 14px;line-height:1.15;letter-spacing:-1px;">${wrapLeaf(escapeHtml(data.titleLine2))}</p>` : ''}
    <section style="width:40px;height:3px;background:${v.primary};border-radius:2px;margin-bottom:12px;"><span leaf=""><br></span></section>
    <p style="font-size:13px;color:${v.mutedText};margin:0;line-height:1.7;">${wrapLeaf(escapeHtml(data.subtitle))}</p>
  </section>
  <section style="border-top:1px solid ${v.borderColor};padding:10px 24px;display:flex;align-items:center;justify-content:space-between;">
    <p style="font-size:12px;color:${v.mutedText};margin:0;font-weight:500;">${wrapLeaf(escapeHtml(data.bottomLeft))}</p>
    <section style="display:flex;gap:4px;">${data.tags.map((t) => `<span style="background:${v.lightBg};color:${v.primary};padding:2px 8px;border-radius:3px;font-size:10px;font-weight:600;">${wrapLeaf(escapeHtml(t))}</span>`).join('')}</section>
  </section>
</section>`
    },

    introCard: (data) => {
      const v = designVars
      const author = data.author
        ? `<p style="text-align:right;font-size:13px;color:${v.mutedText};margin:12px 0 0;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(`—— ${data.author}`)))}</p>`
        : ''
      return `<section style="margin:0 0 28px;border-left:3px solid ${v.primary};padding:20px 24px;background:${v.lightBg};border-radius:0 12px 12px 0;">
  <p style="font-size:15px;color:${v.secondaryText};margin:0;line-height:1.9;letter-spacing:0.3px;font-style:italic;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(data.text)))}</p>
  ${author}
</section>`
    },

    toc: (items) => {
      const v = designVars
      const tocItems = items
        .map(
          (item) =>
            `<section style="display:flex;align-items:center;gap:12px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px dashed ${v.borderColor};"><span style="font-size:20px;font-weight:900;color:${v.primary};min-width:28px;font-style:italic;">${wrapLeaf(escapeHtml(item.num))}</span><span style="font-size:14px;color:${v.secondaryText};line-height:1.6;font-weight:500;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(item.title)))}</span></section>`
        )
        .join('')
      return `<section style="margin:0 0 28px;background:#FAFAFA;border-radius:12px;padding:20px 24px;">
  <p style="font-size:12px;font-weight:700;color:${v.primary};letter-spacing:2px;margin:0 0 16px;text-transform:uppercase;">${wrapLeaf('本期看点')}</p>
  ${tocItems}
</section>`
    },

    chapterTitle: (data) => {
      const v = designVars
      return `<section style="margin:36px 0 20px;padding-bottom:12px;border-bottom:2px solid ${v.primary};">
  <section style="display:flex;align-items:baseline;gap:12px;margin-bottom:6px;">
    <span style="font-size:32px;font-weight:900;color:${v.primary};line-height:1;letter-spacing:-2px;font-style:italic;">${wrapLeaf(escapeHtml(data.num))}</span>
    <span style="font-size:11px;font-weight:700;color:${v.mutedText};letter-spacing:2px;text-transform:uppercase;">${wrapLeaf(escapeHtml(data.enLabel))}</span>
  </section>
  <p style="font-size:19px;font-weight:800;color:${v.titleColor};margin:0;line-height:1.4;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(data.title)))}</p>
</section>`
    },

    signature: (data) => {
      const v = designVars
      return `<section style="margin:40px 0 0;padding:28px 24px;background:${v.lightBg};border-radius:12px;border-top:3px solid ${v.primary};text-align:center;">
  <p style="font-size:14px;color:${v.secondaryText};margin:0 0 8px;line-height:1.8;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(`我是${data.author}，${data.bio}`)))}</p>
  <p style="font-size:13px;color:${v.mutedText};margin:0;line-height:1.8;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(data.cta)))}</p>
</section>`
    },
  },
  skeleton: ['cover', 'introCard', 'toc', 'chapters', 'signature'],
  recipe: {
    观点: ['cover', 'introCard', 'toc', 'chapterTitle', 'goldQuote', 'quoteBlock', 'signature'],
    分析: ['cover', 'introCard', 'toc', 'chapterTitle', 'goldQuote', 'signature'],
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
