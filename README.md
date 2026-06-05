# rehype-fluent-emoji

[![npm version](https://img.shields.io/npm/v/rehype-fluent-emoji.svg)](https://www.npmjs.com/package/rehype-fluent-emoji)

A [rehype](https://github.com/rehypejs/rehype) plugin that replaces Unicode emoji in text nodes with [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) visuals.

Works at the HAST (rehype) stage, is SSR-safe, and outputs `<span>` elements that keep the original emoji character in the DOM for copy and screen readers.

## Installation

```sh
npm install rehype-fluent-emoji
```

Requires Node.js 18+.

## Usage

```ts
import rehype from 'rehype'
import rehypeFluentEmoji from 'rehype-fluent-emoji'

const file = await rehype()
  .data('settings', {fragment: true})
  .use(rehypeFluentEmoji, {
    style: 'color',
    ext: 'svg',
    className: 'fluent-emoji'
  })
  .process('<p>Hello 😺</p>')

console.log(String(file))
```

### Before

```html
<p>Hello 😺</p>
```

### After

```html
<style data-fluent-emoji-style>.fluent-emoji{position:relative}.fluent-emoji-text{color:transparent;-webkit-text-fill-color:transparent;user-select:text;-webkit-user-select:text}.fluent-emoji-text::selection{color:transparent;-webkit-text-fill-color:transparent}.fluent-emoji-visual{position:absolute;inset:0;z-index:1;pointer-events:none;user-select:none;-webkit-user-select:none;background-position:center;background-size:1em 1em;background-repeat:no-repeat}</style><p>Hello <span class="fluent-emoji" data-fluent-emoji><span class="fluent-emoji-text">😺</span><span class="fluent-emoji-visual" aria-hidden="true" style="background-image:url(https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/1f63a_color.svg)"></span></span></p>
```

## Why `<span>` instead of `<img>`

- **Copy-friendly** — the original Unicode emoji stays in a text layer, so users can copy `😺` instead of an image URL
- **Screen reader friendly** — assistive technology reads the emoji character naturally
- **Lightbox-safe** — common image zoom/lightbox libraries target `<img>` and usually ignore `<span>`

Each emoji uses two layers inside a root `<span>`:

1. **Text layer** — the original Unicode character underneath, kept transparent and selectable for copy, screen readers, and selection
2. **Visual layer** — an `aria-hidden` background image rendered on top so Fluent Emoji stays visible during selection

`pointer-events: none` on the visual layer keeps the text layer selectable. The plugin injects one shared `<style data-fluent-emoji-style>` element for layout and selection rules, and only sets per-emoji `background-image` inline on the visual layer.

## Examples

### Multiple emoji

**Input**

```html
<p>Hello 😺 world 👍</p>
```

**Output**

```html
<p>Hello <span class="fluent-emoji" data-fluent-emoji>...</span> world <span class="fluent-emoji" data-fluent-emoji>...</span></p>
```

### Skin tone and ZWJ sequences

```html
<p>👍🏻 👨‍👩‍👧‍👦</p>
```

Each emoji becomes its own `<span>` with the matching Fluent Emoji background URL and the original Unicode text preserved inside.

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
| `assetBase` | `string` | jsDelivr CDN | Base URL for emoji assets |
| `ext` | `string` | `'svg'` | File extension for emoji assets |
| `className` | `string` | `'fluent-emoji'` | CSS class on generated spans |
| `style` | `'color' \| 'flat' \| 'high-contrast'` | `'color'` | Fluent Emoji visual style |
| `title` | `(emoji: string) => string \| undefined` | `undefined` | Optional title attribute resolver |

#### Generated asset paths

Assets follow the [fluentui-emoji-unicode](https://github.com/shuding/fluentui-emoji-unicode) naming convention with flattened lowercase hexadecimal filenames:

```
{assetBase}/{unicode-code}_{style}.{ext}
```

Examples:

| Emoji | Filename |
| --- | --- |
| 😺 | `1f63a_color.svg` |
| 👍🏻 | `1f44d-1f3fb_color.svg` |
| 👨‍👩‍👧‍👦 | `1f468-200d-1f469-200d-1f467-200d-1f466_color.svg` |
| 🇺🇸 | `1f1fa-1f1f8_color.svg` |
| 🏳️‍⚧️ | `1f3f3-fe0f-200d-26a7-fe0f_color.svg` |

### `toFluentEmojiCode(emoji)`

Utility that converts an emoji string to its Fluent Emoji Unicode asset code.

```ts
import {toFluentEmojiCode} from 'rehype-fluent-emoji'

toFluentEmojiCode('😺') // '1f63a'
toFluentEmojiCode('🏳️‍⚧️') // '1f3f3-fe0f-200d-26a7-fe0f'
```

### `toFluentEmojiUrl(emoji, options?)`

Utility that converts an emoji string to a Fluent Emoji asset URL using the same flattened Unicode path format as the plugin.

```ts
import {toFluentEmojiUrl} from 'rehype-fluent-emoji'

toFluentEmojiUrl('😺')
// 'https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/1f63a_color.svg'
toFluentEmojiUrl('👍🏻', {assetBase: '/emoji', style: 'flat', ext: 'png'})
// '/emoji/1f44d-1f3fb_flat.png'
```

### Types

```ts
import type {RehypeFluentEmojiOptions} from 'rehype-fluent-emoji'
```

## Accessibility

Each emoji becomes a `<span>` with a transparent text child and a visual background layer underneath:

- **Text layer** — the emoji character itself for screen readers and copy, kept transparent while remaining selectable
- **Visual layer** — Fluent Emoji image rendered above the text layer so it stays visible during selection
- **Shared CSS** — the plugin injects one `<style data-fluent-emoji-style>` tag for layout, selection, and visual-layer rules
- **No `role="img"`** — avoids replacing the character with a separate image object
- **Optional `title`** — only when you provide a custom resolver

## Lightbox and image libraries

Because emoji are rendered as `<span>` elements instead of `<img>`, they are unlikely to be picked up by lightbox, medium-zoom, or gallery plugins that scan images.

The `data-fluent-emoji` attribute is also available if you need an explicit exclusion hook in custom scripts.

## Asset requirements

This plugin does **not** bundle Fluent Emoji assets. By default it loads flattened Unicode-named files from [fluentui-emoji-unicode](https://github.com/shuding/fluentui-emoji-unicode) via jsDelivr:

```
https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/1f63a_color.svg
https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/1f44d-1f3fb_color.svg
https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/1f468-200d-1f469-200d-1f467-200d-1f466_color.svg
```

Override `assetBase` if you want to self-host the same filenames locally.

## SSR support

The plugin operates purely on HAST trees. It does not use browser APIs, the DOM, or React. It is safe to run in Node.js during static site generation or server-side rendering.

## Ignored elements

Emoji inside the following elements are never transformed:

- `<code>`
- `<pre>`
- `<kbd>`
- `<samp>`
- `<script>`
- `<style>`

This preserves literal emoji in source code, terminal output, and other contexts where the character itself should remain visible.

## License

MIT
