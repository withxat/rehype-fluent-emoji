import type { Element, Properties } from 'hast'

import type { ResolvedOptions } from './options.js'

import {
	buildRootStyle,
	buildTextStyle,
	buildVisualStyle,
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
	}

	const rootStyle = buildRootStyle(options.inlineStyle)

	if (rootStyle) {
		properties.style = rootStyle
	}

	const title = options.title?.(emoji)

	if (title !== undefined) {
		properties.title = title
	}

	const textProperties: Properties = {
		className: classNames.text,
	}

	const visualProperties: Properties = {
		ariaHidden: 'true',
		className: classNames.visual,
		style: buildVisualStyle(url, options.inlineStyle),
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
