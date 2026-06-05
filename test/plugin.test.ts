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

function getImages(tree: Root): Element[] {
	const images: Element[] = []

	const walk = (node: Root['children'][number]) => {
		if (node.type === 'element') {
			if (node.tagName === 'img') {
				images.push(node)
			}

			for (const child of node.children) {
				walk(child)
			}
		}
	}

	for (const child of tree.children) {
		walk(child)
	}

	return images
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
		it('replaces a single emoji', async () => {
			const result = await process('<p>Hello 😺</p>')

			expect(result).toContain('class="fluent-emoji"')
			expect(result).toContain('src="/emoji/1f63a_color.svg"')
			expect(result).toContain('alt="😺"')
			expect(result).toContain('title="grinning cat"')
			expect(result).not.toContain('aria-hidden')
			expect(result).not.toContain('role=')
		})

		it('replaces multiple emoji in one text node', async () => {
			const result = await process('<p>Hello 😺 world 👍</p>')

			expect(result).toContain('src="/emoji/1f63a_color.svg"')
			expect(result).toContain('src="/emoji/1f44d_color.svg"')
			expect(result).toContain('Hello')
			expect(result).toContain('world')
		})

		it('handles mixed text and emoji', () => {
			const tree = processTree('<p>Hi 😺 there</p>')
			const paragraph = tree.children[0] as Element

			expect(paragraph.children).toHaveLength(3)
			expect((paragraph.children[0] as Text).value).toBe('Hi ')
			expect((paragraph.children[1] as Element).tagName).toBe('img')
			expect((paragraph.children[2] as Text).value).toBe(' there')
		})

		it('handles adjacent emoji', () => {
			const tree = processTree('<p>😺👍</p>')
			const paragraph = tree.children[0] as Element

			expect(paragraph.children).toHaveLength(2)
			expect((paragraph.children[0] as Element).properties.src).toBe(
				'/emoji/1f63a_color.svg',
			)
			expect((paragraph.children[1] as Element).properties.src).toBe(
				'/emoji/1f44d_color.svg',
			)
		})

		it('preserves nested non-ignored elements', async () => {
			const result = await process('<p><strong>😺</strong></p>')

			expect(result).toContain('<strong>')
			expect(result).toContain('src="/emoji/1f63a_color.svg"')
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

	describe('accessibility', () => {
		it('sets alt, title, class, and src', () => {
			const tree = processTree('<p>😺</p>')
			const image = getImages(tree)[0]!

			expect(image.properties.alt).toBe('😺')
			expect(image.properties.title).toBe('grinning cat')
			expect(image.properties.className).toBe('fluent-emoji')
			expect(image.properties.src).toBe('/emoji/1f63a_color.svg')
		})

		it('omits title when title is false', () => {
			const tree = processTree('<p>😺</p>', { title: false })
			const image = getImages(tree)[0]!

			expect(image.properties.title).toBeUndefined()
			expect(image.properties.alt).toBe('😺')
		})

		it('supports a custom title resolver', () => {
			const tree = processTree('<p>😺</p>', {
				title: emoji => `Emoji: ${emoji}`,
			})
			const image = getImages(tree)[0]!

			expect(image.properties.title).toBe('Emoji: 😺')
		})

		it('omits title when resolver returns undefined', () => {
			const tree = processTree('<p>😺</p>', {
				title: () => undefined,
			})
			const image = getImages(tree)[0]!

			expect(image.properties.title).toBeUndefined()
		})

		it('does not add aria-hidden or presentation role', () => {
			const tree = processTree('<p>😺</p>')
			const image = getImages(tree)[0]!

			expect(image.properties.ariaHidden).toBeUndefined()
			expect(image.properties.role).toBeUndefined()
		})
	})

	describe('options', () => {
		it('supports custom assetBase', async () => {
			const result = await process('<p>😺</p>', {
				assetBase: 'https://cdn.example.com/emoji',
			})

			expect(result).toContain(
				'src="https://cdn.example.com/emoji/1f63a_color.svg"',
			)
		})

		it('supports custom style and ext', async () => {
			const result = await process('<p>👍🏻</p>', {
				ext: 'png',
				style: 'flat',
			})

			expect(result).toContain('src="/emoji/1f44d-1f3fb_flat.png"')
		})

		it('supports custom className', async () => {
			const result = await process('<p>😺</p>', { className: 'emoji-img' })

			expect(result).toContain('class="emoji-img"')
		})

		it('resolves CLDR titles for complex emoji', () => {
			const tree = processTree('<p>👨‍👩‍👧‍👦 🇺🇸 🏳️‍⚧️</p>')
			const images = getImages(tree)

			expect(images[0]!.properties.title).toBe('family: man, woman, girl, boy')
			expect(images[1]!.properties.src).toBe('/emoji/1f1fa-1f1f8_color.svg')
			expect(images[2]!.properties.title).toBe('transgender flag')
			expect(images[2]!.properties.src).toBe(
				'/emoji/1f3f3-fe0f-200d-26a7-fe0f_color.svg',
			)
		})
	})
})
