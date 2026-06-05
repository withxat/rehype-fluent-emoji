import type { ResolvedOptions } from './options.js'

import { defaultOptions } from './options.js'
import { toFluentEmojiCode } from './to-fluent-emoji-code.js'

export interface FluentEmojiUrlOptions {
	/** Base URL for emoji assets. @default '/emoji' when self-hosting */
	assetBase?: string
	/** File extension for emoji assets. @default 'svg' */
	ext?: string
	/** Fluent Emoji visual style. @default 'color' */
	style?: ResolvedOptions['style']
}

/** Convert an emoji string to its Fluent Emoji asset filename. */
export function toFluentEmojiFilename(
	emoji: string,
	options: FluentEmojiUrlOptions = {},
): string {
	const ext = options.ext ?? defaultOptions.ext
	const style = options.style ?? defaultOptions.style
	const code = toFluentEmojiCode(emoji)

	return `${code}_${style}.${ext}`
}

/** Convert an emoji string to a Fluent Emoji asset URL. */
export function toFluentEmojiUrl(
	emoji: string,
	options: FluentEmojiUrlOptions = {},
): string {
	const assetBase = options.assetBase ?? defaultOptions.assetBase
	const base = assetBase.replace(/\/$/, '')

	return `${base}/${toFluentEmojiFilename(emoji, options)}`
}
