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
  primary: '#52525B',
  secondary: '#71717A',
  lightBg: '#F4F4F5',
  lightBorder: '#D4D4D8',
  lightBorderSoft: '#E4E4E7',
  highlight: '#FDE68A',
  highlightBg: '#FFFBEB',
  titleColor: '#18181B',
  bodyColor: '#3F3F46',
  secondaryText: '#52525B',
  mutedText: '#A1A1AA',
  borderColor: '#E4E4E7',
  lightGrayBg: '#F4F4F5',
  bodyFontSize: '14px',
  bodyLineHeight: '2.0',
  fontFamily: `-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif`,
}

export const graphiteMinimal = createTheme({
  id: 'graphite-minimal',
  name: '石墨极简风',
  primary: '#52525B',
  underlineCSS: 'border-bottom:2px solid #52525B;font-weight:600;',
  description: '极简克制、留白理性、全灰阶，高端品牌质感',
  suitableFor: '设计、科技评论、专业观点、高端品牌',
  designVars,
  components: {
    cover: (data) => {
      const v = designVars
      return `<section style="margin:0 0 36px;padding:40px 32px 32px;background:#FAFAFA;border-radius:4px;">
  <p style="font-size:11px;font-weight:600;letter-spacing:4px;color:${v.mutedText};margin:0 0 24px;text-transform:uppercase;">${wrapLeaf(escapeHtml(data.topTag))}<span style="margin-left:16px;color:${v.borderColor};">${wrapLeaf(escapeHtml(data.date))}</span></p>
  ${data.oldBelief ? `<p style="font-size:14px;color:${v.mutedText};margin:0 0 10px;text-decoration:line-through;">${wrapLeaf(escapeHtml(data.oldBelief))}</p>` : ''}
  <p style="font-size:28px;font-weight:300;color:${v.titleColor};margin:0;line-height:1.2;letter-spacing:-0.5px;">${wrapLeaf(escapeHtml(data.titleLine1))}<span style="font-weight:800;color:${v.titleColor};">${wrapLeaf(escapeHtml(data.highlightWord))}</span></p>
  ${data.titleLine2 ? `<p style="font-size:28px;font-weight:300;color:${v.primary};margin:0 0 16px;line-height:1.2;letter-spacing:-0.5px;">${wrapLeaf(escapeHtml(data.titleLine2))}</p>` : ''}
  <section style="width:32px;height:1px;background:${v.primary};margin:20px 0 14px;"><span leaf=""><br></span></section>
  <p style="font-size:13px;color:${v.mutedText};margin:0;line-height:1.8;">${wrapLeaf(escapeHtml(data.subtitle))}</p>
  <section style="margin-top:24px;display:flex;align-items:center;gap:8px;">
    <p style="font-size:11px;color:${v.mutedText};margin:0;letter-spacing:1px;">${wrapLeaf(escapeHtml(data.bottomLeft))}</p>
    ${data.tags.map((t) => `<span style="border:1px solid ${v.borderColor};color:${v.secondaryText};padding:2px 8px;border-radius:2px;font-size:10px;letter-spacing:1px;">${wrapLeaf(escapeHtml(t))}</span>`).join('')}
  </section>
</section>`
    },

    introCard: (data) => {
      const v = designVars
      const author = data.author
        ? `<p style="text-align:right;font-size:12px;color:${v.mutedText};margin:16px 0 0;letter-spacing:1px;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(`—— ${data.author}`)))}</p>`
        : ''
      return `<section style="margin:0 0 32px;padding:28px 0;border-top:1px solid ${v.borderColor};border-bottom:1px solid ${v.borderColor};">
  <p style="font-size:16px;color:${v.titleColor};margin:0;line-height:2.0;letter-spacing:0.5px;font-weight:400;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(data.text)))}</p>
  ${author}
</section>`
    },

    toc: (items) => {
      const v = designVars
      const tocItems = items
        .map(
          (item) =>
            `<section style="display:flex;align-items:baseline;gap:16px;margin-bottom:14px;"><span style="font-size:13px;font-weight:600;color:${v.primary};min-width:24px;letter-spacing:1px;">${wrapLeaf(escapeHtml(item.num))}</span><span style="font-size:14px;color:${v.secondaryText};line-height:1.6;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(item.title)))}</span></section>`
        )
        .join('')
      return `<section style="margin:0 0 32px;padding:24px 0;border-bottom:1px solid ${v.borderColor};">
  <p style="font-size:11px;font-weight:600;color:${v.mutedText};letter-spacing:3px;margin:0 0 18px;text-transform:uppercase;">${wrapLeaf('Index')}</p>
  ${tocItems}
</section>`
    },

    chapterTitle: (data) => {
      const v = designVars
      return `<section style="margin:48px 0 24px;">
  <section style="display:flex;align-items:baseline;gap:14px;margin-bottom:4px;">
    <span style="font-size:13px;font-weight:600;color:${v.mutedText};letter-spacing:2px;">${wrapLeaf(escapeHtml(data.num))}</span>
    <span style="font-size:10px;color:${v.borderColor};letter-spacing:2px;text-transform:uppercase;">${wrapLeaf(escapeHtml(data.enLabel))}</span>
  </section>
  <p style="font-size:22px;font-weight:700;color:${v.titleColor};margin:0;line-height:1.3;letter-spacing:-0.3px;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(data.title)))}</p>
  <section style="width:24px;height:2px;background:${v.primary};margin-top:14px;"><span leaf=""><br></span></section>
</section>`
    },

    signature: (data) => {
      const v = designVars
      return `<section style="margin:48px 0 0;padding:32px 0;border-top:1px solid ${v.borderColor};text-align:center;">
  <p style="font-size:14px;color:${v.secondaryText};margin:0 0 8px;line-height:1.9;font-weight:300;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(`我是${data.author}，${data.bio}`)))}</p>
  <p style="font-size:12px;color:${v.mutedText};margin:0;line-height:1.8;letter-spacing:0.5px;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(data.cta)))}</p>
</section>`
    },
  },
  skeleton: ['cover', 'introCard', 'toc', 'chapters', 'signature'],
  recipe: {
    观点: ['cover', 'introCard', 'toc', 'chapterTitle', 'goldQuote', 'signature'],
    评论: ['cover', 'introCard', 'toc', 'chapterTitle', 'quoteBlock', 'signature'],
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
