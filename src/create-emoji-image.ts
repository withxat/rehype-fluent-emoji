import type { Element, Properties } from 'hast'

import type { ResolvedOptions } from './options.js'

import { toFluentEmojiUrl } from './to-fluent-emoji-url.js'

/** Create a HAST `<img>` element for a Fluent Emoji asset. */
export function createEmojiImage(
	emoji: string,
	options: ResolvedOptions,
): Element {
	const properties: Properties = {
		alt: emoji,
		className: options.className,
		src: toFluentEmojiUrl(emoji, options),
	}

	const title = options.title?.(emoji)

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
