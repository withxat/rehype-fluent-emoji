import type { Root } from 'hast'

import type { RehypeFluentEmojiOptions } from './options.js'

import { resolveOptions } from './options.js'
import { transformTree } from './transform.js'

/**
 * Rehype plugin that replaces Unicode emoji in text nodes with Fluent Emoji
 * `<span>` elements that preserve the original Unicode for copy and screen readers.
 */
export function rehypeFluentEmoji(options?: RehypeFluentEmojiOptions) {
	const settings = resolveOptions(options)

	return async (tree: Root) => {
		await transformTree(tree, settings)
	}
}
