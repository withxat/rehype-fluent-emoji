import type { Element, Properties } from 'hast'

import type { ResolvedOptions } from './options.js'

import { getEmojiLabel } from './emoji-titles.js'
import { toFluentEmojiCode } from './to-fluent-emoji-code.js'

function resolveTitle(
	emoji: string,
	title: ResolvedOptions['title'],
): string | undefined {
	if (title === false) {
		return undefined
	}

	if (typeof title === 'function') {
		return title(emoji)
	}

	return getEmojiLabel(emoji)
}

function buildAssetUrl(emoji: string, options: ResolvedOptions): string {
	const code = toFluentEmojiCode(emoji)
	const base = options.assetBase.replace(/\/$/, '')

	return `${base}/${code}_${options.style}.${options.ext}`
}

/** Create a HAST `<img>` element for a Fluent Emoji asset. */
export function createEmojiImage(
	emoji: string,
	options: ResolvedOptions,
): Element {
	const properties: Properties = {
		alt: emoji,
		className: options.className,
		src: buildAssetUrl(emoji, options),
	}

	const title = resolveTitle(emoji, options.title)

	if (title !== undefined) {
		properties.title = title
	}

	return {
		children: [],
		properties,
		tagName: 'img',
		type: 'element',
	}
}
