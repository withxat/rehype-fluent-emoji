# rehype-fluent-emoji

[![npm version](https://img.shields.io/npm/v/rehype-fluent-emoji.svg)](https://www.npmjs.com/package/rehype-fluent-emoji)

English | [简体中文](./README.zh-CN.md)

A [rehype](https://github.com/rehypejs/rehype) plugin that replaces Unicode emoji in text nodes with [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) visuals.

Works at the HAST (rehype) stage, is SSR-safe, and outputs `<span>` elements that keep the original emoji character in the DOM for copy and screen readers.

## Features

- Replaces emoji in text nodes with Fluent Emoji `<span>` elements
- Emits configurable asset URLs with `assetBase`
- Provides a separate `rehype-fluent-emoji sync` command for downloading used assets
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
      style="background-image:url(/emoji/1f63a_color.webp)"
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
2. Injects one shared `<style data-fluent-emoji-style>` element
3. Replaces each emoji with a `<span>` whose visual layer only sets per-emoji `background-image`

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

The plugin only transforms HAST and generates asset URLs. It does not download files or write to `public` during transformation. Use the `sync` command when you want to self-host assets.

#### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `assetBase` | `string` | `'/emoji'` | Base URL for emoji assets in generated HTML |
| `ext` | `string` | `'webp'` | File extension for emoji assets |
| `className` | `string` | `'fluent-emoji'` | CSS class on generated spans |
| `style` | `'3d' \| 'color' \| 'flat' \| 'high-contrast'` | `'color'` | Fluent Emoji visual style |
| `title` | `(emoji: string) => string \| undefined` | `undefined` | Optional title attribute resolver |

### Sync assets

Use the CLI to download the Fluent Emoji assets referenced by your content:

```sh
rehype-fluent-emoji sync content --out public/emoji
```

The local URL and output directory should line up:

```ts
rehypeFluentEmoji({
  assetBase: '/emoji',
})
```

```sh
rehype-fluent-emoji sync content --out public/emoji
```

For CDN hosting, sync the files into a staging directory and upload them with your own asset pipeline:

```ts
rehypeFluentEmoji({
  assetBase: 'https://cdn.example.com/emoji',
})
```

```sh
rehype-fluent-emoji sync content --out .emoji-assets
```

#### Sync options

```sh
rehype-fluent-emoji sync <file-or-directory...> [options]
```

| Option | Default | Description |
| --- | --- | --- |
| `--out <dir>` | `public/emoji` | Directory to write downloaded assets into, relative to `--cwd` |
| `--cwd <dir>` | `process.cwd()` | Project root used to resolve input paths and `--out` |
| `--repository <repo>` | `withxat/fluentui-emoji-unicode` | GitHub repo URL, shorthand, or raw asset base used when downloading |
| `--branch <ref>` | `webp` | Git ref used with `--repository` when the URL does not include a branch |
| `--style <style>` | `color` | Fluent Emoji visual style |
| `--ext <ext>` | `webp` | Asset file extension |

#### Asset repository

By default, assets are downloaded from [withxat/fluentui-emoji-unicode](https://github.com/withxat/fluentui-emoji-unicode).

`--repository` accepts:

```ts
// GitHub repository URL
'https://github.com/withxat/fluentui-emoji-unicode'

// GitHub repository URL with branch
'https://github.com/withxat/fluentui-emoji-unicode/tree/webp'

// owner/repo shorthand
'withxat/fluentui-emoji-unicode'

// already-resolved raw asset base
'https://raw.githubusercontent.com/withxat/fluentui-emoji-unicode/webp/assets'
```

#### Generated asset paths

Assets follow the [fluentui-emoji-unicode](https://github.com/withxat/fluentui-emoji-unicode) naming convention with flattened lowercase hexadecimal filenames. Generated URLs use the normalized emoji code: non-skintone emoji strip every `fe0f` from `metadata.unicode`; skintone emoji keep the `unicodeSkintones` code as-is. The sync command tries that normalized code first, then falls back to the full Unicode sequence as the source when needed while still writing the normalized filename:

```
{assetBase}/{unicode-code}_{style}.{ext}
```

Examples:

| Emoji | Filename |
| --- | --- |
| 😺 | `1f63a_color.webp` |
| 😺 with `style: '3d'` | `1f63a_3d.webp` |
| 😺 with `style: 'flat'` | `1f63a_flat.webp` |
| 😺 with `style: 'high-contrast'` | `1f63a_high-contrast.webp` |
| 👍🏻 | `1f44d-1f3fb_color.webp` |
| 👨‍👩‍👧‍👦 | `1f468-200d-1f469-200d-1f467-200d-1f466_color.webp` |
| 🇺🇸 | `1f1fa-1f1f8_color.webp` |
| 🛠️ | `1f6e0_color.webp` |
| 🏳️‍⚧️ | `1f3f3-200d-26a7_color.webp` |

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

toFluentEmojiUrl('😺') // '/emoji/1f63a_color.webp'
toFluentEmojiUrl('👍🏻', { style: 'flat' }) // '/emoji/1f44d-1f3fb_flat.webp'
toFluentEmojiUrl('😺', { style: '3d' }) // '/emoji/1f63a_3d.webp'
```

### Visual styles

Assets are downloaded from the [`webp`](https://github.com/withxat/fluentui-emoji-unicode/tree/webp) branch of [fluentui-emoji-unicode](https://github.com/withxat/fluentui-emoji-unicode), where all four Fluent Emoji styles are available as WebP files:

- `color` — default colorful style
- `3d` — three-dimensional style
- `flat` — flat style
- `high-contrast` — high-contrast style

```ts
rehypeFluentEmoji({
  style: '3d',
})
```

You can still override `ext` if you host assets in another format.

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

Run the plugin during HTML or MDX processing, then run `rehype-fluent-emoji sync` for the same content so the referenced files land in `public/emoji`.

If your framework uses a different public directory, point `assetBase` at the served URL and pass the matching directory to `sync --out`:

```ts
rehypeFluentEmoji({
  assetBase: '/emoji',
})
```

```sh
rehype-fluent-emoji sync content --out static/emoji
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

This plugin does **not** bundle Fluent Emoji assets. The rehype plugin only emits URLs. Use `rehype-fluent-emoji sync` to download the emoji used in your content from [withxat/fluentui-emoji-unicode](https://github.com/withxat/fluentui-emoji-unicode) into `public/emoji` or another output directory:

```
public/emoji/1f63a_color.webp
public/emoji/1f44d-1f3fb_color.webp
public/emoji/1f468-200d-1f469-200d-1f467-200d-1f466_color.webp
```

Generated HTML then references them as `/emoji/...`.

Existing files are reused on later sync runs, so only new emoji trigger downloads.

You may want to commit `public/emoji` if your deployment does not run the sync step, or ignore it if assets are always regenerated locally or in CI.

## SSR support

The plugin operates on HAST trees in Node.js and only emits HTML with asset URLs. It does not use browser APIs or write files during transformation, so it is safe to run during static site generation or server-side rendering.

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
