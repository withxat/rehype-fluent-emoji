import type { Parents, Root, Text } from 'hast'

import type { ResolvedOptions } from './options.js'

import emojiRegex from 'emoji-regex'
import { SKIP, visit } from 'unist-util-visit'

import { collectEmojis } from './collect-emojis.js'
import { IGNORED_ELEMENTS } from './constants.js'
import { createEmojiSpan } from './create-emoji-span.js'
import { injectEmojiStyle } from './inject-emoji-style.js'
import { syncEmojiAssets } from './sync-emoji-assets.js'

const globalEmojiRegex = new RegExp(emojiRegex(), 'g')

/** Mark every node inside ignored elements so their text is left untouched. */
function markIgnoredNodes(tree: Root): WeakSet<object> {
	const ignored = new WeakSet<object>()

	visit(tree, 'element', (element) => {
		if (!IGNORED_ELEMENTS.has(element.tagName)) {
			return
		}

		visit(element, (descendant) => {
			ignored.add(descendant)
		})
	})

	return ignored
}

function splitTextNode(
	node: Text,
	options: ResolvedOptions,
): Array<ReturnType<typeof createEmojiSpan> | Text> {
	const value = node.value
	const matches = [...value.matchAll(globalEmojiRegex)]

	if (matches.length === 0) {
		return [node]
	}

	const nodes: Array<ReturnType<typeof createEmojiSpan> | Text> = []
	let lastIndex = 0

	for (const match of matches) {
		const emoji = match[0]
		const index = match.index ?? 0

		if (index > lastIndex) {
			nodes.push({ type: 'text', value: value.slice(lastIndex, index) })
		}

		nodes.push(createEmojiSpan(emoji, options))
		lastIndex = index + emoji.length
	}

	if (lastIndex < value.length) {
		nodes.push({ type: 'text', value: value.slice(lastIndex) })
	}

	return nodes
}

/** Replace emoji in text nodes with Fluent Emoji `<span>` elements. */
export async function transformTree(
	tree: Root,
	options: ResolvedOptions,
): Promise<void> {
	const ignored = markIgnoredNodes(tree)
	const emojis = collectEmojis(tree, ignored)

	if (emojis.size > 0) {
		await syncEmojiAssets(emojis, options)
	}

	let hasEmoji = false

	visit(tree, 'text', (node, index, parent) => {
		if (!parent || index === undefined || ignored.has(node)) {
			return
		}

		const nodes = splitTextNode(node, options)

		if (nodes.length === 1 && nodes[0] === node) {
			return
		}

		hasEmoji = true
		;(parent as Parents).children.splice(index, 1, ...nodes)

		return [SKIP, index + nodes.length]
	})

	if (hasEmoji) {
		injectEmojiStyle(tree, options.className)
	}
}
