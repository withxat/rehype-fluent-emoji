import type { Element, Properties } from 'hast'

import type { ResolvedOptions } from './options.js'

import {
	buildVisualBackgroundStyle,
	getEmojiClassNames,
} from './fluent-emoji-style.js'
import { toFluentEmojiUrl } from './to-fluent-emoji-url.js'

/** Create a HAST `<span>` element that shows Fluent Emoji via CSS background. */
export function createEmojiSpan(
	emoji: string,
	options: ResolvedOptions,
): Element {
	const classNames = getEmojiClassNames(options.className)

	const properties: Properties = {
		className: classNames.root,
		dataFluentEmoji: '',
	}

	const textProperties: Properties = {
		className: classNames.text,
	}

	const visualProperties: Properties = {
		ariaHidden: 'true',
		className: classNames.visual,
		style: buildVisualBackgroundStyle(toFluentEmojiUrl(emoji, options)),
	}

	const title = options.title?.(emoji)

	if (title !== undefined) {
		properties.title = title
	}

	return {
		children: [
			{
				children: [{ type: 'text', value: emoji }],
				properties: textProperties,
				tagName: 'span',
				type: 'element',
			},
			{
				children: [],
				properties: visualProperties,
				tagName: 'span',
				type: 'element',
			},
		],
		properties,
		tagName: 'span',
		type: 'element',
	}
}
