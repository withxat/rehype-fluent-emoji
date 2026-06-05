import type { ResolvedOptions } from './options.js'

import { defaultOptions } from './options.js'
import { toFluentEmojiCode } from './to-fluent-emoji-code.js'

export interface FluentEmojiUrlOptions {
	/** Base URL path for emoji assets. @default '/emoji' */
	assetBase?: string
	/** File extension for emoji assets. @default 'svg' */
	ext?: string
	/** Fluent Emoji visual style. @default 'color' */
	style?: ResolvedOptions['style']
}

/** Convert an emoji string to a Fluent Emoji asset URL. */
export function toFluentEmojiUrl(
	emoji: string,
	options: FluentEmojiUrlOptions = {},
): string {
	const assetBase = options.assetBase ?? defaultOptions.assetBase
	const ext = options.ext ?? defaultOptions.ext
	const style = options.style ?? defaultOptions.style
	const code = toFluentEmojiCode(emoji)
	const base = assetBase.replace(/\/$/, '')

	return `${base}/${code}_${style}.${ext}`
}
