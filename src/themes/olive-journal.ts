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
  primary: '#1e1f23',
  secondary: '#ed7b2f',
  lightBg: '#F5F4F0',
  lightBorder: '#E0DFD9',
  lightBorderSoft: '#EDEAE3',
  highlight: '#FFF3E0',
  highlightBg: '#FFF8F0',
  titleColor: '#1e1f23',
  bodyColor: '#3D3D3D',
  secondaryText: '#5C5C5C',
  mutedText: '#9E9E9E',
  borderColor: '#E0DFD9',
  lightGrayBg: '#F5F4F0',
  bodyFontSize: '14px',
  bodyLineHeight: '1.85',
  fontFamily: `'PingFang SC','Hiragino Sans GB','Microsoft YaHei',-apple-system,sans-serif`,
}

export const oliveJournal = createTheme({
  id: 'olive-journal',
  name: '橄榄手记',
  primary: '#1e1f23',
  underlineCSS: 'border-bottom:2px solid #ed7b2f;font-weight:600;',
  description: '编辑部内刊质感，墨黑+橙色点睛，分节形式多样',
  suitableFor: '内刊手记、深度评测、案例复盘、系统性说明文档',
  designVars,
  codeStyle: 'dark',
  components: {
    cover: (data) => {
      const v = designVars
      return `<section style="margin:0 0 32px;background:#fff;border:1px solid ${v.borderColor};border-radius:6px;overflow:hidden;">
  <section style="background:${v.primary};padding:24px 26px;">
    <section style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <span style="font-size:10px;font-weight:700;letter-spacing:3px;color:rgba(255,255,255,0.5);text-transform:uppercase;">${wrapLeaf(escapeHtml(data.topTag))}</span>
      <span style="font-size:10px;color:rgba(255,255,255,0.4);font-weight:500;">${wrapLeaf(escapeHtml(data.date))}</span>
    </section>
    ${data.oldBelief ? `<p style="font-size:13px;color:rgba(255,255,255,0.4);margin:0 0 8px;text-decoration:line-through;">${wrapLeaf(escapeHtml(data.oldBelief))}</p>` : ''}
    <p style="font-size:24px;font-weight:800;color:#fff;margin:0;line-height:1.2;letter-spacing:-0.5px;">${wrapLeaf(escapeHtml(data.titleLine1))}<span style="color:${v.secondary};">${wrapLeaf(escapeHtml(data.highlightWord))}</span></p>
    ${data.titleLine2 ? `<p style="font-size:24px;font-weight:800;color:${v.secondary};margin:0 0 14px;line-height:1.2;letter-spacing:-0.5px;">${wrapLeaf(escapeHtml(data.titleLine2))}</p>` : ''}
    <p style="font-size:12px;color:rgba(255,255,255,0.5);margin:12px 0 0;line-height:1.6;">${wrapLeaf(escapeHtml(data.subtitle))}</p>
  </section>
  <section style="padding:10px 26px;display:flex;align-items:center;justify-content:space-between;border-top:3px solid ${v.secondary};background:${v.lightBg};">
    <p style="font-size:11px;color:${v.mutedText};margin:0;font-weight:600;">${wrapLeaf(escapeHtml(data.bottomLeft))}</p>
    <section style="display:flex;gap:6px;">${data.tags.map((t) => `<span style="color:${v.secondary};font-size:10px;font-weight:700;letter-spacing:0.5px;">${wrapLeaf('#' + escapeHtml(t))}</span>`).join('')}</section>
  </section>
</section>`
    },

    chapterTitle: (data) => {
      const v = designVars
      return `<section style="margin:36px 0 20px;">
  <section style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
    <section style="width:28px;height:28px;background:${v.primary};border-radius:4px;display:flex;align-items:center;justify-content:center;"><span style="font-size:13px;font-weight:800;color:#fff;">${wrapLeaf(escapeHtml(data.num))}</span></section>
    <span style="font-size:10px;font-weight:700;color:${v.secondary};letter-spacing:2px;text-transform:uppercase;">${wrapLeaf(escapeHtml(data.enLabel))}</span>
  </section>
  <p style="font-size:18px;font-weight:700;color:${v.titleColor};margin:0;line-height:1.4;letter-spacing:-0.2px;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(data.title)))}</p>
  <section style="width:100%;height:1px;background:${v.borderColor};margin-top:12px;"><span leaf=""><br></span></section>
</section>`
    },

    signature: (data) => {
      const v = designVars
      return `<section style="margin:40px 0 0;padding:24px 22px;background:${v.lightBg};border-radius:6px;border-top:3px solid ${v.primary};">
  <p style="font-size:12px;font-weight:700;color:${v.secondary};letter-spacing:1px;margin:0 0 8px;text-transform:uppercase;">${wrapLeaf('关于作者')}</p>
  <p style="font-size:14px;color:${v.secondaryText};margin:0 0 6px;line-height:1.8;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(`我是${data.author}，${data.bio}`)))}</p>
  <p style="font-size:13px;color:${v.mutedText};margin:0;line-height:1.7;">${wrapLeaf(escapeHtml(toFullWidthPunctuation(data.cta)))}</p>
</section>`
    },
  },
  skeleton: ['cover', 'introCard', 'toc', 'chapters', 'signature'],
  recipe: {
    案例: ['cover', 'introCard', 'toc', 'chapterTitle', 'numberedTitle', 'tipBlock', 'signature'],
    评测: ['cover', 'introCard', 'toc', 'chapterTitle', 'goldQuote', 'tipBlock', 'signature'],
    内刊: ['cover', 'introCard', 'toc', 'chapterTitle', 'quoteBlock', 'signature'],
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
