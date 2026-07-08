/**
 * md2html - 公众号排版工具
 * Copyright (C) 2026 diyun <diyun@diyun.site>
 * Licensed under AGPL-3.0-or-later. See LICENSE for full text.
 * Based on gzh-design-skill by 甲木 × 摸鱼小李
 * https://github.com/isjiamu/gzh-design-skill
 */

import type { ThemeConfig } from '../core/types'
import { moyuGreen } from './moyu-green'
import { redWhite } from './red-white'
import { graphiteMinimal } from './graphite-minimal'
import { zenWhitespace } from './zen-whitespace'
import { moyuTicket } from './moyu-ticket'
import { oliveJournal } from './olive-journal'

/** 所有已注册主题 */
export const themes: ThemeConfig[] = [
  moyuGreen,
  redWhite,
  graphiteMinimal,
  zenWhitespace,
  moyuTicket,
  oliveJournal,
]

/** 主题索引 Map */
export const themeMap: Record<string, ThemeConfig> = Object.fromEntries(
  themes.map((t) => [t.id, t])
)

/** 获取主题 */
export function getTheme(id: string): ThemeConfig | undefined {
  return themeMap[id]
}

/** 默认主题 */
export const defaultTheme = themes[0]
