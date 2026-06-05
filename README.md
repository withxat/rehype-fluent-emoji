# rehype-fluent-emoji

[![npm version](https://img.shields.io/npm/v/rehype-fluent-emoji.svg)](https://www.npmjs.com/package/rehype-fluent-emoji)

A [rehype](https://github.com/rehypejs/rehype) plugin that replaces Unicode emoji in text nodes with [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) visuals.

Works at the HAST (rehype) stage, is SSR-safe, and outputs `<span>` elements that keep the original emoji character in the DOM for copy and screen readers.

## Features

- Replaces emoji in text nodes with Fluent Emoji `<span>` elements
- Downloads only the emoji assets used in each document during the build
- Writes assets to `public/emoji` by default and emits local `/emoji/...` URLs
- Keeps the original Unicode character for copy, selection, and screen readers
- Injects one shared `<style data-fluent-emoji-style>` block for layout and selection rules
- Leaves emoji inside `<code>`, `<pre>`, and similar elements unchanged

Requires Node.js 18+.

## Installation

```sh
npm install rehype-fluent-emoji
```

## Usage

```ts
import rehype from 'rehype'
import rehypeFluentEmoji from 'rehype-fluent-emoji'

const file = await rehype()
  .data('settings', { fragment: true })
  .use(rehypeFluentEmoji)
  .process('<p>Hello 😺</p>')

console.log(String(file))
```

The plugin is async because it downloads used emoji assets during processing.

### Before

```html
<p>Hello 😺</p>
```

### After

```html
<style data-fluent-emoji-style>
.fluent-emoji{position:relative}
.fluent-emoji-text{color:transparent;-webkit-text-fill-color:transparent;user-select:text;-webkit-user-select:text}
.fluent-emoji-text::selection{color:transparent;-webkit-text-fill-color:transparent}
.fluent-emoji-visual{position:absolute;inset:0;z-index:1;pointer-events:none;user-select:none;-webkit-user-select:none;background-position:center;background-size:1em 1em;background-repeat:no-repeat}
</style>
<p>
  Hello
  <span class="fluent-emoji" data-fluent-emoji>
    <span class="fluent-emoji-text">😺</span>
    <span
      class="fluent-emoji-visual"
      aria-hidden="true"
      style="background-image:url(/emoji/1f63a_color.svg)"
    ></span>
  </span>
</p>
```

## How it works

Each emoji becomes a root `<span>` with two layers:

1. **Text layer** — the original Unicode character underneath, kept transparent and selectable
2. **Visual layer** — an `aria-hidden` background image rendered on top so Fluent Emoji stays visible during text selection

During the build, the plugin:

1. Scans eligible text nodes for Unicode emoji
2. Downloads only the referenced assets from the configured repository into `public/emoji`
3. Injects one shared `<style data-fluent-emoji-style>` element
4. Replaces each emoji with a `<span>` whose visual layer only sets per-emoji `background-image`

`pointer-events: none` on the visual layer keeps the text layer selectable.

## Why `<span>` instead of `<img>`

- **Copy-friendly** — users can still copy `😺` instead of an image URL
- **Screen reader friendly** — assistive technology reads the emoji character naturally
- **Selection-friendly** — text selection highlights behave like normal text
- **Lightbox-safe** — common image zoom/lightbox libraries target `<img>` and usually ignore `<span>`

## Examples

### Multiple emoji

**Input**

```html
<p>Hello 😺 world 👍</p>
```

**Output**

```html
<p>
  Hello
  <span class="fluent-emoji" data-fluent-emoji>...</span>
  world
  <span class="fluent-emoji" data-fluent-emoji>...</span>
</p>
```

### Skin tone and ZWJ sequences

```html
<p>👍🏻 👨‍👩‍👧‍👦</p>
```

Each emoji becomes its own `<span>` with the matching Fluent Emoji asset and the original Unicode text preserved inside.

### Ignored elements

Emoji inside code-like elements are left unchanged:

```html
<p>Visible 😺 <code>😺</code></p>
<pre><code>👍🏻</code></pre>
```

Only the paragraph emoji is replaced; the code and pre blocks stay as Unicode.

## API

### `rehypeFluentEmoji(options?)`

Rehype plugin that scans text nodes for Unicode emoji and replaces them with Fluent Emoji `<span>` elements.

#### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `assetBase` | `string` | `'/emoji'` | Base URL for emoji assets in generated HTML |
| `assetOutputDir` | `string` | `'public/emoji'` | Directory for downloaded assets, relative to `cwd` |
| `assetRepository` | `string` | `withxat/fluentui-emoji-unicode` | GitHub repo URL, shorthand, or raw asset base used when downloading |
| `assetRepositoryBranch` | `string` | `'main'` | Git ref used with `assetRepository` when the URL does not include a branch |
| `cwd` | `string` | `process.cwd()` | Project root used to resolve `assetOutputDir` |
| `ext` | `string` | `'svg'` (`'png'` for `style: '3d'`) | File extension for emoji assets |
| `className` | `string` | `'fluent-emoji'` | CSS class on generated spans |
| `style` | `'3d' \| 'color' \| 'flat' \| 'high-contrast'` | `'color'` | Fluent Emoji visual style |
| `title` | `(emoji: string) => string \| undefined` | `undefined` | Optional title attribute resolver |

#### Asset repository

By default, assets are downloaded from [withxat/fluentui-emoji-unicode](https://github.com/withxat/fluentui-emoji-unicode).

`assetRepository` accepts:

```ts
// GitHub repository URL
'https://github.com/withxat/fluentui-emoji-unicode'

// GitHub repository URL with branch
'https://github.com/withxat/fluentui-emoji-unicode/tree/main'

// owner/repo shorthand
'withxat/fluentui-emoji-unicode'

// already-resolved raw asset base
'https://raw.githubusercontent.com/withxat/fluentui-emoji-unicode/main/assets'
```

#### Generated asset paths

Assets follow the [fluentui-emoji-unicode](https://github.com/withxat/fluentui-emoji-unicode) naming convention with flattened lowercase hexadecimal filenames. Non-skintone emoji strip every `fe0f` from `metadata.unicode`; skintone emoji keep the `unicodeSkintones` code as-is. The plugin tries the stripped code first, then falls back to the full Unicode sequence when needed:

```
{assetBase}/{unicode-code}_{style}.{ext}
```

Examples:

| Emoji | Filename |
| --- | --- |
| 😺 | `1f63a_color.svg` |
| 😺 with `style: '3d'` | `1f63a_3d.png` |
| 👍🏻 | `1f44d-1f3fb_color.svg` |
| 👨‍👩‍👧‍👦 | `1f468-200d-1f469-200d-1f467-200d-1f466_color.svg` |
| 🇺🇸 | `1f1fa-1f1f8_color.svg` |
| 🛠️ | `1f6e0_color.svg` |
| 🏳️‍⚧️ | `1f3f3-200d-26a7_color.svg` |

### `toFluentEmojiCode(emoji)`

Utility that converts an emoji string to its Fluent Emoji Unicode asset code.

```ts
import { toFluentEmojiCode } from 'rehype-fluent-emoji'

toFluentEmojiCode('😺') // '1f63a'
toFluentEmojiCode('🛠️') // '1f6e0'
toFluentEmojiCode('🏳️‍⚧️') // '1f3f3-200d-26a7'
```

### `toFluentEmojiUrl(emoji, options?)`

Utility that converts an emoji string to a Fluent Emoji asset URL using the same flattened Unicode path format as the plugin.

```ts
import { toFluentEmojiUrl } from 'rehype-fluent-emoji'

toFluentEmojiUrl('😺') // '/emoji/1f63a_color.svg'
toFluentEmojiUrl('👍🏻', { style: 'flat', ext: 'png' }) // '/emoji/1f44d-1f3fb_flat.png'
toFluentEmojiUrl('😺', { style: '3d', ext: 'png' }) // '/emoji/1f63a_3d.png'
```

### Safari rendering

The default `color` assets are SVG files and some Fluent Emoji icons use SVG filters for shadows and highlights. Safari can render those filtered SVGs softly, especially on Retina displays. Use `style: '3d'` to reference PNG assets, or `style: 'flat'` for filter-free SVG assets.

```ts
rehypeFluentEmoji({
  style: '3d',
})
```

When `style` is `3d`, the plugin uses `png` as the default `ext`.

### Types

```ts
import type { RehypeFluentEmojiOptions } from 'rehype-fluent-emoji'
```

## Framework notes

### Astro

```ts
import rehypeFluentEmoji from 'rehype-fluent-emoji'

export default defineConfig({
  markdown: {
    rehypePlugins: [rehypeFluentEmoji],
  },
})
```

Make sure your site serves files from `public/emoji` at `/emoji/...`.

### Next.js / general static sites

Run the plugin during HTML or MDX processing. The downloaded files land in `public/emoji`, so they are served automatically in most setups.

If your framework uses a different public directory, set `assetOutputDir` and `assetBase` together:

```ts
rehypeFluentEmoji({
  assetOutputDir: 'static/emoji',
  assetBase: '/emoji',
})
```

## Accessibility

Each emoji becomes a `<span>` with a transparent text child and a visual background layer on top:

- **Text layer** — the emoji character itself for screen readers and copy, kept transparent while remaining selectable
- **Visual layer** — Fluent Emoji image rendered above the text layer so it stays visible during selection
- **Shared CSS** — the plugin injects one `<style data-fluent-emoji-style>` tag for layout, selection, and visual-layer rules
- **No `role="img"`** — avoids replacing the character with a separate image object
- **Optional `title`** — only when you provide a custom resolver

## Lightbox and image libraries

Because emoji are rendered as `<span>` elements instead of `<img>`, they are unlikely to be picked up by lightbox, medium-zoom, or gallery plugins that scan images.

The `data-fluent-emoji` attribute is also available if you need an explicit exclusion hook in custom scripts.

## Asset requirements

This plugin does **not** bundle Fluent Emoji assets. By default it downloads only the emoji used in each document from [withxat/fluentui-emoji-unicode](https://github.com/withxat/fluentui-emoji-unicode) into `public/emoji` during the rehype build:

```
public/emoji/1f63a_color.svg
public/emoji/1f44d-1f3fb_color.svg
public/emoji/1f468-200d-1f469-200d-1f467-200d-1f466_color.svg
```

Generated HTML then references them as `/emoji/...`.

Existing files are reused on later builds, so only new emoji trigger downloads.

You may want to commit `public/emoji` if your deployment does not run the rehype build step, or ignore it if assets are always regenerated locally or in CI.

## SSR support

The plugin operates on HAST trees in Node.js. During the build it downloads used emoji assets with `fetch`, writes them under `public/emoji`, and emits local `/emoji/...` URLs. It is safe to run during static site generation or server-side rendering.

## Ignored elements

Emoji inside the following elements are never transformed:

- `<code>`
- `<pre>`
- `<kbd>`
- `<samp>`
- `<script>`
- `<style>`

This preserves literal emoji in source code, terminal output, and other contexts where the character itself should remain visible.

## Development

```sh
pnpm install
pnpm test
pnpm run build
```

## Author

**rehype-fluent-emoji** © [Xat](https://github.com/withxat), Released under the [MIT](https://github.com/withxat/rehype-fluent-emoji/blob/main/LICENSE) License.<br>
Authored and maintained by Xat with help from contributors ([list](https://github.com/withxat/rehype-fluent-emoji/graphs/contributors)).

> [Blog](https://blog.xat.sh) · GitHub [@withxat](https://github.com/withxat) · Telegram [@withxat](https://t.me/withxat) · X [@withxat](https://x.com/withxat) · Email [i@xat.sh](mailto:i@xat.sh)
