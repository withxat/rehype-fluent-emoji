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
    assetBase: '/emoji',
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
<p>Hello <span class="fluent-emoji" data-fluent-emoji style="display:inline-block;position:relative;width:1em;height:1em;overflow:hidden;vertical-align:middle"><span class="fluent-emoji-text" style="display:inline-block;position:relative;z-index:0;width:100%;height:100%;padding:0;margin:0;border:0;overflow:hidden;white-space:nowrap;line-height:1;pointer-events:none;user-select:text;-webkit-user-select:text;color:transparent!important;-webkit-text-fill-color:transparent!important">😺</span><span class="fluent-emoji-visual" aria-hidden="true" style="position:absolute;inset:0;z-index:1;pointer-events:none;user-select:none;-webkit-user-select:none;background:url(/emoji/1f63a_color.svg) center/contain no-repeat"></span></span></p>
```

## Why `<span>` instead of `<img>`

- **Copy-friendly** — the original Unicode emoji stays in a text layer, so users can copy `😺` instead of an image URL
- **Screen reader friendly** — assistive technology reads the emoji character naturally
- **Lightbox-safe** — common image zoom/lightbox libraries target `<img>` and usually ignore `<span>`

Each emoji uses three layers:

1. **Root `<span>`** — `1em` layout box with relative positioning
2. **Text layer** — the original Unicode character, kept transparent and selectable so copying selected text preserves the emoji while custom selection backgrounds can still render
3. **Visual layer** — an `aria-hidden` overlay with the Fluent Emoji background, kept above the text layer so the SVG renders over the selected text

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
| `assetBase` | `string` | `'/emoji'` | Base URL or path for emoji assets |
| `ext` | `string` | `'svg'` | File extension for emoji assets |
| `className` | `string` | `'fluent-emoji'` | CSS class on generated spans |
| `inlineStyle` | `boolean` | `true` | Emit full inline styles for each span |
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

toFluentEmojiUrl('😺') // '/emoji/1f63a_color.svg'
toFluentEmojiUrl('👍🏻', {assetBase: 'https://cdn.example.com/emoji', style: 'flat', ext: 'png'})
// 'https://cdn.example.com/emoji/1f44d-1f3fb_flat.png'
```

### `FLUENT_EMOJI_CSS`

Recommended stylesheet for shared styles and selection-state fixes:

```ts
import {FLUENT_EMOJI_CSS} from 'rehype-fluent-emoji'

// Inject into your app CSS bundle or a <style> tag
```

```ts
rehypeFluentEmoji({inlineStyle: false})
```

When using `inlineStyle: false`, each visual layer only sets `--fluent-emoji-url: url(...)` inline, and `FLUENT_EMOJI_CSS` provides the shared layout rules.

`FLUENT_EMOJI_CSS` is also useful with the default inline styles because `::selection` cannot be represented in a `style` attribute. Its selection rule keeps the Unicode glyph transparent during selection without overriding the site's selection background.

### Types

```ts
import type {RehypeFluentEmojiOptions} from 'rehype-fluent-emoji'
```

## Accessibility

Each emoji becomes a `<span>` with a hidden text child and a visual overlay:

- **Visual layer** — Fluent Emoji image on a `1em` inline box
- **Text layer** — the emoji glyph itself for screen readers and copy, kept transparent while remaining selectable and letting selection backgrounds render; include `FLUENT_EMOJI_CSS` to force this in `::selection`
- **No `role="img"`** — avoids replacing the character with a separate image object
- **Optional `title`** — only when you provide a custom resolver

## Lightbox and image libraries

Because emoji are rendered as `<span>` elements instead of `<img>`, they are unlikely to be picked up by lightbox, medium-zoom, or gallery plugins that scan images.

The `data-fluent-emoji` attribute is also available if you need an explicit exclusion hook in custom scripts.

## Asset requirements

This plugin does **not** bundle Fluent Emoji assets. Host flattened Unicode-named files yourself or use a CDN such as [fluentui-emoji-unicode](https://github.com/shuding/fluentui-emoji-unicode):

```
/emoji/1f63a_color.svg
/emoji/1f44d-1f3fb_color.svg
/emoji/1f468-200d-1f469-200d-1f467-200d-1f466_color.svg
```

Point `assetBase` at your asset directory or CDN root.

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
