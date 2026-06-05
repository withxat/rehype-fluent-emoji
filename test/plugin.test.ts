import type { Element, Root, Text } from 'hast'

import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'
import { unified } from 'unified'
import { describe, expect, it } from 'vitest'

import { rehypeFluentEmoji } from '../src/plugin.js'

async function process(html: string, options?: Parameters<typeof rehypeFluentEmoji>[0]) {
	const file = await unified()
		.use(rehypeParse, { fragment: true })
		.use(rehypeFluentEmoji, options)
		.use(rehypeStringify)
		.process(html)

	return String(file)
}

function getEmojiSpans(tree: Root): Element[] {
	const spans: Element[] = []

	const walk = (node: Root['children'][number]) => {
		if (node.type === 'element') {
			if (node.tagName === 'span' && node.properties.dataFluentEmoji !== undefined) {
				spans.push(node)
			}

			for (const child of node.children) {
				walk(child)
			}
		}
	}

	for (const child of tree.children) {
		walk(child)
	}

	return spans
}

function getEmojiTextSpan(root: Element, className = 'fluent-emoji'): Element {
	const textClass = `${className}-text`

	return root.children.find(
		(child): child is Element =>
			child.type === 'element'
			&& child.tagName === 'span'
			&& child.properties.className === textClass,
	)!
}

function processTree(
	html: string,
	options?: Parameters<typeof rehypeFluentEmoji>[0],
): Root {
	const processor = unified()
		.use(rehypeParse, { fragment: true })
		.use(rehypeFluentEmoji, options)

	const tree = processor.parse(html) as Root

	processor.runSync(tree)

	return tree
}

describe('rehypeFluentEmoji', () => {
	describe('transformation', () => {
		it('replaces a single emoji with a span', async () => {
			const result = await process('<p>Hello 😺</p>')

			expect(result).toContain('class="fluent-emoji"')
			expect(result).toContain('class="fluent-emoji-text"')
			expect(result).toContain('data-fluent-emoji')
			expect(result).toContain('background:url(/emoji/1f63a_color.svg)')
			expect(result).toContain('>😺</span>')
			expect(result).not.toContain('fluent-emoji-visual')
			expect(result).not.toContain('<img')
			expect(result).not.toContain('role=')
		})

		it('replaces multiple emoji in one text node', async () => {
			const result = await process('<p>Hello 😺 world 👍</p>')

			expect(result).toContain('background:url(/emoji/1f63a_color.svg)')
			expect(result).toContain('background:url(/emoji/1f44d_color.svg)')
			expect(result).toContain('Hello')
			expect(result).toContain('world')
		})

		it('handles mixed text and emoji', () => {
			const tree = processTree('<p>Hi 😺 there</p>')
			const paragraph = tree.children[0] as Element

			expect(paragraph.children).toHaveLength(3)
			expect((paragraph.children[0] as Text).value).toBe('Hi ')
			expect((paragraph.children[1] as Element).tagName).toBe('span')
			expect((paragraph.children[2] as Text).value).toBe(' there')
		})

		it('handles adjacent emoji', () => {
			const tree = processTree('<p>😺👍</p>')
			const paragraph = tree.children[0] as Element

			expect(paragraph.children).toHaveLength(2)
			expect(getEmojiTextSpan(paragraph.children[0] as Element).children[0]).toEqual({
				type: 'text',
				value: '😺',
			})
			expect(getEmojiTextSpan(paragraph.children[1] as Element).children[0]).toEqual({
				type: 'text',
				value: '👍',
			})
		})

		it('preserves nested non-ignored elements', async () => {
			const result = await process('<p><strong>😺</strong></p>')

			expect(result).toContain('<strong>')
			expect(result).toContain('background:url(/emoji/1f63a_color.svg)')
		})

		it('ignores emoji inside inline code', async () => {
			const result = await process('<p><code>😺</code></p>')

			expect(result).toBe('<p><code>😺</code></p>')
		})

		it('ignores emoji inside pre blocks', async () => {
			const result = await process('<pre>😺</pre>')

			expect(result).toBe('<pre>😺</pre>')
		})

		it('ignores emoji inside pre > code', async () => {
			const result = await process('<pre><code>👍🏻</code></pre>')

			expect(result).toBe('<pre><code>👍🏻</code></pre>')
		})

		it('ignores emoji inside kbd, samp, script, and style', async () => {
			expect(await process('<kbd>😺</kbd>')).toBe('<kbd>😺</kbd>')
			expect(await process('<samp>😺</samp>')).toBe('<samp>😺</samp>')
			expect(await process('<script>😺</script>')).toBe('<script>😺</script>')
			expect(await process('<style>😺</style>')).toBe('<style>😺</style>')
		})
	})

	describe('accessibility and copy', () => {
		it('keeps the emoji character in a visually hidden text layer', () => {
			const tree = processTree('<p>😺</p>')
			const span = getEmojiSpans(tree)[0]!
			const textSpan = getEmojiTextSpan(span)

			expect(textSpan.children).toEqual([{ type: 'text', value: '😺' }])
			expect(span.properties.role).toBeUndefined()
			expect(span.properties.ariaHidden).toBeUndefined()
		})

		it('renders the fluent emoji background on the root span', () => {
			const tree = processTree('<p>😺</p>')
			const span = getEmojiSpans(tree)[0]!

			expect(span.properties.style).toContain('/emoji/1f63a_color.svg')
			expect(span.properties.style).toContain('background:url')
		})

		it('hides the unicode glyph while keeping it selectable for copy', () => {
			const tree = processTree('<p>😺</p>')
			const textSpan = getEmojiTextSpan(getEmojiSpans(tree)[0]!)

			expect(textSpan.properties.style).toContain('display:inline-block')
			expect(textSpan.properties.style).toContain('width:100%')
			expect(textSpan.properties.style).toContain('height:100%')
			expect(textSpan.properties.style).toContain('user-select:text')
			expect(textSpan.properties.style).toContain('-webkit-user-select:text')
			expect(textSpan.properties.style).toContain('pointer-events:none')
			expect(textSpan.properties.style).toContain('color:transparent')
			expect(textSpan.properties.style).toContain('-webkit-text-fill-color:transparent')
			expect(textSpan.properties.style).not.toContain('user-select:none')
			expect(textSpan.properties.style).not.toContain('clip:')
		})

		it('omits title by default', () => {
			const tree = processTree('<p>😺</p>')
			const span = getEmojiSpans(tree)[0]!

			expect(span.properties.title).toBeUndefined()
		})

		it('supports a custom title resolver', () => {
			const tree = processTree('<p>😺</p>', {
				title: emoji => `Emoji: ${emoji}`,
			})
			const span = getEmojiSpans(tree)[0]!

			expect(span.properties.title).toBe('Emoji: 😺')
		})

		it('omits title when resolver returns undefined', () => {
			const tree = processTree('<p>😺</p>', {
				title: () => undefined,
			})
			const span = getEmojiSpans(tree)[0]!

			expect(span.properties.title).toBeUndefined()
		})
	})

	describe('options', () => {
		it('supports custom assetBase', async () => {
			const result = await process('<p>😺</p>', {
				assetBase: 'https://cdn.example.com/emoji',
			})

			expect(result).toContain(
				'background:url(https://cdn.example.com/emoji/1f63a_color.svg)',
			)
		})

		it('supports custom style and ext', async () => {
			const result = await process('<p>👍🏻</p>', {
				ext: 'png',
				style: 'flat',
			})

			expect(result).toContain('background:url(/emoji/1f44d-1f3fb_flat.png)')
		})

		it('supports custom className', async () => {
			const result = await process('<p>😺</p>', { className: 'emoji-img' })

			expect(result).toContain('class="emoji-img"')
			expect(result).toContain('class="emoji-img-text"')
		})

		it('supports inlineStyle: false with css variable on the root span', () => {
			const tree = processTree('<p>😺</p>', { inlineStyle: false })
			const span = getEmojiSpans(tree)[0]!

			expect(span.properties.style).toBe(
				'--fluent-emoji-url:url(/emoji/1f63a_color.svg)',
			)
		})

		it('builds asset URLs for complex emoji', () => {
			const tree = processTree('<p>👨‍👩‍👧‍👦 🇺🇸 🏳️‍⚧️</p>')
			const spans = getEmojiSpans(tree)

			expect(spans[0]!.properties.style).toContain(
				'/emoji/1f468-200d-1f469-200d-1f467-200d-1f466_color.svg',
			)
			expect(spans[1]!.properties.style).toContain('/emoji/1f1fa-1f1f8_color.svg')
			expect(spans[2]!.properties.style).toContain(
				'/emoji/1f3f3-fe0f-200d-26a7-fe0f_color.svg',
			)
		})
	})
})
