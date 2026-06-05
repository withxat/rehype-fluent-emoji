import type { Element, Root } from 'hast'

import { visit } from 'unist-util-visit'

import { buildSharedStyle } from './fluent-emoji-style.js'

const STYLE_MARKER = 'dataFluentEmojiStyle'

function hasEmojiStyle(tree: Root): boolean {
	let found = false

	visit(tree, 'element', (element) => {
		if (
			element.tagName === 'style'
			&& element.properties[STYLE_MARKER] !== undefined
		) {
			found = true
		}
	})

	return found
}

function findHead(tree: Root): Element | undefined {
	let head: Element | undefined

	visit(tree, 'element', (element) => {
		if (element.tagName === 'head') {
			head = element
		}
	})

	return head
}

/** Inject a shared `<style>` element for Fluent Emoji layout and selection. */
export function injectEmojiStyle(tree: Root, className: string): void {
	if (hasEmojiStyle(tree)) {
		return
	}

	const styleElement: Element = {
		children: [{ type: 'text', value: buildSharedStyle(className) }],
		properties: {
			[STYLE_MARKER]: '',
		},
		tagName: 'style',
		type: 'element',
	}

	const head = findHead(tree)

	if (head) {
		head.children.unshift(styleElement)
		return
	}

	tree.children.unshift(styleElement)
}
