import type { Root, Text } from 'hast'

import emojiRegex from 'emoji-regex'
import { visit } from 'unist-util-visit'

const globalEmojiRegex = new RegExp(emojiRegex(), 'g')

/** Collect Unicode emoji from text nodes that are eligible for transformation. */
export function collectEmojis(
	tree: Root,
	ignored: WeakSet<object>,
): Set<string> {
	const emojis = new Set<string>()

	visit(tree, 'text', (node: Text) => {
		if (ignored.has(node)) {
			return
		}

		for (const match of node.value.matchAll(globalEmojiRegex)) {
			emojis.add(match[0])
		}
	})

	return emojis
}
