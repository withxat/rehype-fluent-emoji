import type { Element, Root, Text } from 'hast'

import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'
import { unified } from 'unified'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_ASSET_BASE } from '../src/constants.js'
import { rehypeFluentEmoji } from '../src/plugin.js'
import { resetSyncedPathsForTests } from '../src/sync-emoji-assets.js'
import { resetResolvedFluentEmojiCodesForTests } from '../src/to-fluent-emoji-code.js'

let tempDir = ''

function getTestPluginOptions(): Parameters<typeof rehypeFluentEmoji>[0] {
	return {
		assetBase: DEFAULT_ASSET_BASE,
		assetOutputDir: 'emoji',
		cwd: tempDir,
	}
}

beforeEach(async () => {
	resetSyncedPathsForTests()
	resetResolvedFluentEmojiCodesForTests()
	tempDir = await mkdtemp(path.join(os.tmpdir(), 'rehype-fluent-emoji-plugin-'))
	vi.stubGlobal('fetch', vi.fn(async () => new Response('<svg></svg>', { status: 200 })))
})

afterEach(async () => {
	vi.unstubAllGlobals()
	await rm(tempDir, { force: true, recursive: true })
})

function defaultEmojiUrl(file: string) {
	return `background-image:url(${DEFAULT_ASSET_BASE}/${file})`
}

async function process(html: string, options?: Parameters<typeof rehypeFluentEmoji>[0]) {
	const file = await unified()
		.use(rehypeParse, { fragment: true })
		.use(rehypeFluentEmoji, { ...getTestPluginOptions(), ...options })
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

function getEmojiVisualSpan(root: Element, className = 'fluent-emoji'): Element {
	const visualClass = `${className}-visual`

	return root.children.find(
		(child): child is Element =>
			child.type === 'element'
			&& child.tagName === 'span'
			&& child.properties.className === visualClass,
	)!
}

async function processTree(
	html: string,
	options?: Parameters<typeof rehypeFluentEmoji>[0],
): Promise<Root> {
	const processor = unified()
		.use(rehypeParse, { fragment: true })
		.use(rehypeFluentEmoji, { ...getTestPluginOptions(), ...options })

	const tree = processor.parse(html) as Root

	await processor.run(tree)

	return tree
}

describe('rehypeFluentEmoji', () => {
	describe('transformation', () => {
		it('replaces a single emoji with a span', async () => {
			const result = await process('<p>Hello 😺</p>')

			expect(result).toContain('class="fluent-emoji"')
			expect(result).toContain('class="fluent-emoji-text"')
			expect(result).toContain('class="fluent-emoji-visual"')
			expect(result).toContain('data-fluent-emoji')
			expect(result).toContain(defaultEmojiUrl('1f63a_color.svg'))
			expect(result).toContain('>😺</span>')
			expect(result).not.toContain('background-clip:text')
			expect(result).not.toContain('<img')
			expect(result).not.toContain('role=')
		})

		it('replaces multiple emoji in one text node', async () => {
			const result = await process('<p>Hello 😺 world 👍</p>')

			expect(result).toContain(defaultEmojiUrl('1f63a_color.svg'))
			expect(result).toContain(defaultEmojiUrl('1f44d_color.svg'))
			expect(result).toContain('Hello')
			expect(result).toContain('world')
		})

		it('handles mixed text and emoji', async () => {
			const tree = await processTree('<p>Hi 😺 there</p>')
			const paragraph = tree.children.find(
				(child): child is Element =>
					child.type === 'element' && child.tagName === 'p',
			)!

			expect(paragraph.children).toHaveLength(3)
			expect((paragraph.children[0] as Text).value).toBe('Hi ')
			expect((paragraph.children[1] as Element).tagName).toBe('span')
			expect((paragraph.children[2] as Text).value).toBe(' there')
		})

		it('handles adjacent emoji', async () => {
			const tree = await processTree('<p>😺👍</p>')
			const paragraph = tree.children.find(
				(child): child is Element =>
					child.type === 'element' && child.tagName === 'p',
			)!

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
			expect(result).toContain(defaultEmojiUrl('1f63a_color.svg'))
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
		it('keeps the emoji character in a text layer for copy and screen readers', async () => {
			const tree = await processTree('<p>😺</p>')
			const span = getEmojiSpans(tree)[0]!
			const textSpan = getEmojiTextSpan(span)

			expect(textSpan.children).toEqual([{ type: 'text', value: '😺' }])
			expect(span.properties.role).toBeUndefined()
			expect(span.properties.ariaHidden).toBeUndefined()
		})

		it('renders only the background image inline on the visual layer', async () => {
			const tree = await processTree('<p>😺</p>')
			const span = getEmojiSpans(tree)[0]!
			const visualSpan = getEmojiVisualSpan(span)

			expect(span.properties.style).toBeUndefined()
			expect(visualSpan.properties.style).toBe(
				`background-image:url(${DEFAULT_ASSET_BASE}/1f63a_color.svg)`,
			)
			expect(visualSpan.properties.ariaHidden).toBe('true')
		})

		it('keeps shared text styles in the injected stylesheet', async () => {
			const result = await process('<p>😺</p>')
			const tree = await processTree('<p>😺</p>')
			const textSpan = getEmojiTextSpan(getEmojiSpans(tree)[0]!)

			expect(textSpan.properties.style).toBeUndefined()
			expect(result).toContain('.fluent-emoji-text{color:transparent;-webkit-text-fill-color:transparent')
			expect(result).toContain('.fluent-emoji-visual{position:absolute;inset:0;z-index:1')
		})

		it('omits title by default', async () => {
			const tree = await processTree('<p>😺</p>')
			const span = getEmojiSpans(tree)[0]!

			expect(span.properties.title).toBeUndefined()
		})

		it('supports a custom title resolver', async () => {
			const tree = await processTree('<p>😺</p>', {
				title: emoji => `Emoji: ${emoji}`,
			})
			const span = getEmojiSpans(tree)[0]!

			expect(span.properties.title).toBe('Emoji: 😺')
		})

		it('omits title when resolver returns undefined', async () => {
			const tree = await processTree('<p>😺</p>', {
				title: () => undefined,
			})
			const span = getEmojiSpans(tree)[0]!

			expect(span.properties.title).toBeUndefined()
		})
	})

	describe('shared style', () => {
		it('injects a shared style element when emoji are replaced', async () => {
			const result = await process('<p>Hello 😺</p>')

			expect(result).toContain('data-fluent-emoji-style')
			expect(result).toContain('.fluent-emoji{position:relative}')
			expect(result).toContain('.fluent-emoji-text::selection{color:transparent;-webkit-text-fill-color:transparent}')
		})

		it('does not inject a style element when no emoji is replaced', async () => {
			const result = await process('<p>Hello world</p>')

			expect(result).not.toContain('data-fluent-emoji-style')
		})

		it('injects the style element into head for full documents', async () => {
			const file = await unified()
				.use(rehypeParse)
				.use(rehypeFluentEmoji, getTestPluginOptions())
				.use(rehypeStringify)
				.process('<!doctype html><html><head><title>Test</title></head><body><p>😺</p></body></html>')

			const result = String(file)

			expect(result).toContain('<head><style data-fluent-emoji-style')
			expect(result).not.toMatch(/<body><style data-fluent-emoji-style>/)
		})

		it('uses the custom class name in the injected shared style', async () => {
			const result = await process('<p>😺</p>', { className: 'emoji-img' })

			expect(result).toContain('.emoji-img{position:relative}')
			expect(result).toContain('.emoji-img-text::selection{color:transparent;-webkit-text-fill-color:transparent}')
		})
	})

	describe('options', () => {
		it('supports custom assetBase', async () => {
			const result = await process('<p>😺</p>', {
				assetBase: 'https://cdn.example.com/emoji',
			})

			expect(result).toContain(
				'background-image:url(https://cdn.example.com/emoji/1f63a_color.svg)',
			)
		})

		it('supports custom style and ext', async () => {
			const result = await process('<p>👍🏻</p>', {
				ext: 'png',
				style: 'flat',
			})

			expect(result).toContain(
				`background-image:url(${DEFAULT_ASSET_BASE}/1f44d-1f3fb_flat.png)`,
			)
		})

		it('supports custom className', async () => {
			const result = await process('<p>😺</p>', { className: 'emoji-img' })

			expect(result).toContain('class="emoji-img"')
			expect(result).toContain('class="emoji-img-text"')
			expect(result).toContain('class="emoji-img-visual"')
		})

		it('builds asset URLs for complex emoji', async () => {
			const result = await process('<p>👨‍👩‍👧‍👦 🇺🇸 🏳️‍⚧️</p>')

			expect(result).toContain(
				`${DEFAULT_ASSET_BASE}/1f468-200d-1f469-200d-1f467-200d-1f466_color.svg`,
			)
			expect(result).toContain(`${DEFAULT_ASSET_BASE}/1f1fa-1f1f8_color.svg`)
			expect(result).toContain(
				`${DEFAULT_ASSET_BASE}/1f3f3-200d-26a7_color.svg`,
			)
		})
	})
})
