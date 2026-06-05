import type { Root } from 'hast'

import type { RehypeFluentEmojiOptions } from './options.js'

import { resolveOptions } from './options.js'
import { transformTree } from './transform.js'

/**
 * Rehype plugin that replaces Unicode emoji in text nodes with Fluent Emoji
 * `<img>` elements.
 */
export function rehypeFluentEmoji(options?: RehypeFluentEmojiOptions) {
	const settings = resolveOptions(options)

	return (tree: Root) => {
		transformTree(tree, settings)
	}
}
