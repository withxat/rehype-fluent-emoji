import type { Element, Properties } from 'hast'

import type { ResolvedOptions } from './options.js'

import {
	buildRootStyle,
	buildTextStyle,
	getEmojiClassNames,
} from './fluent-emoji-style.js'
import { toFluentEmojiUrl } from './to-fluent-emoji-url.js'

/** Create a HAST `<span>` element that shows Fluent Emoji via CSS background. */
export function createEmojiSpan(
	emoji: string,
	options: ResolvedOptions,
): Element {
	const url = toFluentEmojiUrl(emoji, options)
	const classNames = getEmojiClassNames(options.className)

	const properties: Properties = {
		className: classNames.root,
		dataFluentEmoji: '',
		style: buildRootStyle(url, options.inlineStyle),
	}

	const title = options.title?.(emoji)

	if (title !== undefined) {
		properties.title = title
	}

	const textProperties: Properties = {
		className: classNames.text,
	}

	const textStyle = buildTextStyle(options.inlineStyle)

	if (textStyle) {
		textProperties.style = textStyle
	}

	return {
		children: [
			{
				children: [{ type: 'text', value: emoji }],
				properties: textProperties,
				tagName: 'span',
				type: 'element',
			},
		],
		properties,
		tagName: 'span',
		type: 'element',
	}
}
