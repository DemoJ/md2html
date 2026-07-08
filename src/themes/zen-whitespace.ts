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
  primary: '#4A5D52',
  secondary: '#6B8E76',
  lightBg: '#F0F4F1',
  lightBorder: '#B5C8BC',
  lightBorderSoft: '#D4E2D8',
  highlight: '#FDE68A',
  highlightBg: '#FFFBEB',
  titleColor: '#1C1917',
  bodyColor: '#44403C',
  secondaryText: '#57534E',
  mutedText: '#A8A29E',
  borderColor: '#E7E5E4',
  lightGrayBg: '#F5F5F4',
  bodyFontSize: '14px',
  bodyLineHeight: '2.1',
  fontFamily: `'PingFang SC','Hiragino Sans GB','Microsoft YaHei',-apple-system,sans-serif`,
}

export const zenWhitespace = createTheme({
  id: 'zen-whitespace',
  name: '留白禅意风',
  primary: '#4A5D52',
  underlineCSS: 'border-bottom:1.5px solid #B5C8BC;font-weight:500;',
  description: '呼吸感最强，大留白 + 居中衬线引用，极简随笔',
  suitableFor: '禅意、极简生活、深度随笔、艺术留白',
  designVars,
  components: {
    cover: (data) => {
      const v = designVars
      return `<section style="margin:0 0 48px;padding:60px 32px 48px;text-align:center;">
  <p style="font-size:11px;font-weight:500;letter-spacing:6px;color:${v.mutedText};margin:0 0 40px;text-transform:uppercase;">${wrapLeaf(escapeHtml(data.topTag))}</p>
  ${data.oldBelief ? `<p style="font-size:14px;color:${v.mutedText};margin:0 0 20px;text-decoration:line-through;letter-spacing:1px;">${wrapLeaf(escapeHtml(data.oldBelief))}</p>` : ''}
  <p style="font-size:26px;font-weight:300;color:${v.titleColor};margin:0 0 4px;line-height:1.4;letter-spacing:1px;">${wrapLeaf(escapeHtml(data.titleLine1))}<span style="color:${v.primary};font-weight:500;">${wrapLeaf(escapeHtml(data.highlightWord))}</span></p>
  ${data.titleLine2 ? `<p style="font-size:26px;font-weight:300;color:${v.primary};margin:0 0 24px;line-height:1.4;letter-spacing:1px;">${wrapLeaf(escapeHtml(data.titleLine2))}</p>` : ''}
  <section style="width:1px;height:32px;background:${v.lightBorder};margin:24px auto;"><span leaf=""><br></span></section>
  <p style="font-size:13px;color:${v.mutedText};margin:0;line-height:2.0;letter-spacing:0.5px;">${wrapLeaf(escapeHtml(data.subtitle))}</p>
  <p style="font-size:11px;color:${v.borderColor};margin:32px 0 0;letter-spacing:2px;">${wrapLeaf(escapeHtml(data.date))}<span style="margin:0 8px;color:${v.lightBorder};">${wrapLeaf('·')}</span>${wrapLeaf(escapeHtml(data.bottomLeft))}</p>
</section>`
    },

    introCard: (data) => {
      const v = designVars
      const author = data.author
        ? `<p style="text-align:center;font-size:12px;color:${v.mutedText};margin:20px 0 0;letter-spacing:2px;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(data.author)))}</p>`
        : ''
      return `<section style="margin:0 0 40px;padding:32px 24px;text-align:center;">
  <p style="font-size:16px;color:${v.secondaryText};margin:0;line-height:2.2;letter-spacing:1px;font-weight:300;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(data.text)))}</p>
  ${author}
</section>`
    },

    toc: (items) => {
      const v = designVars
      const tocItems = items
        .map(
          (item) =>
            `<section style="text-align:center;margin-bottom:20px;"><span style="font-size:11px;color:${v.lightBorder};letter-spacing:2px;margin:0 0 4px;">${wrapLeaf(escapeHtml(item.num))}</span><p style="font-size:14px;color:${v.secondaryText};line-height:1.6;font-weight:400;letter-spacing:0.5px;margin:0;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(item.title)))}</p></section>`
        )
        .join('')
      return `<section style="margin:0 0 40px;padding:32px 24px;border-top:1px solid ${v.borderColor};border-bottom:1px solid ${v.borderColor};">
  ${tocItems}
</section>`
    },

    chapterTitle: (data) => {
      const v = designVars
      return `<section style="margin:56px 0 28px;text-align:center;">
  <p style="font-size:11px;color:${v.lightBorder};letter-spacing:4px;margin:0 0 12px;">${wrapLeaf(escapeHtml(data.num))}<span style="margin:0 8px;">${wrapLeaf('·')}</span>${wrapLeaf(escapeHtml(data.enLabel))}</p>
  <p style="font-size:20px;font-weight:400;color:${v.titleColor};margin:0;line-height:1.5;letter-spacing:1px;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(data.title)))}</p>
  <section style="width:20px;height:1px;background:${v.lightBorder};margin:20px auto 0;"><span leaf=""><br></span></section>
</section>`
    },

    signature: (data) => {
      const v = designVars
      return `<section style="margin:56px 0 0;padding:40px 24px;text-align:center;border-top:1px solid ${v.borderColor};">
  <section style="width:1px;height:24px;background:${v.lightBorder};margin:0 auto 20px;"><span leaf=""><br></span></section>
  <p style="font-size:14px;color:${v.secondaryText};margin:0 0 8px;line-height:2.0;font-weight:300;letter-spacing:0.5px;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(`我是${data.author}，${data.bio}`)))}</p>
  <p style="font-size:12px;color:${v.mutedText};margin:0;line-height:1.9;letter-spacing:1px;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(data.cta)))}</p>
</section>`
    },
  },
  skeleton: ['cover', 'introCard', 'toc', 'chapters', 'signature'],
  recipe: {
    随笔: ['cover', 'introCard', 'toc', 'chapterTitle', 'goldQuote', 'signature'],
    禅意: ['cover', 'introCard', 'toc', 'chapterTitle', 'quoteBlock', 'signature'],
  },
  mapping: {
    'heading_1': 'cover',
    'heading_2': 'chapterTitle',
    'heading_3': 'leftBarTitle',
    'paragraph': 'bodyParagraph',
    'blockquote': 'quoteBlock',
    'code_block': 'codeBlockLight',
    'image': 'image',
    'hr': 'hr',
    'list': 'listItem',
  },
})
