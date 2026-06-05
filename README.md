# rehype-fluent-emoji

[![npm version](https://img.shields.io/npm/v/rehype-fluent-emoji.svg)](https://www.npmjs.com/package/rehype-fluent-emoji)

A [rehype](https://github.com/rehypejs/rehype) plugin that replaces Unicode emoji in text nodes with [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) images.

Works at the HAST (rehype) stage, is SSR-safe, and produces accessible `<img>` elements with CLDR emoji labels.

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
<p>Hello <img src="/emoji/1f63a_color.svg" alt="😺" title="grinning cat" class="fluent-emoji"></p>
```

## Examples

### Multiple emoji

**Input**

```html
<p>Hello 😺 world 👍</p>
```

**Output**

```html
<p>Hello <img src="/emoji/1f63a_color.svg" alt="😺" title="grinning cat" class="fluent-emoji"> world <img src="/emoji/1f44d_color.svg" alt="👍" title="thumbs up" class="fluent-emoji"></p>
```

### Skin tone and ZWJ sequences

```html
<p>👍🏻 👨‍👩‍👧‍👦</p>
```

becomes

```html
<p>
  <img src="/emoji/1f44d-1f3fb_color.svg" alt="👍🏻" title="thumbs up: light skin tone" class="fluent-emoji">
  <img src="/emoji/1f468-200d-1f469-200d-1f467-200d-1f466_color.svg" alt="👨‍👩‍👧‍👦" title="family: man, woman, girl, boy" class="fluent-emoji">
</p>
```

### Ignored elements

Emoji inside code-like elements are left unchanged:

```html
<p>Visible 😺 <code>😺</code></p>
<pre><code>👍🏻</code></pre>
```

Only the paragraph emoji is replaced; the code and pre blocks stay as Unicode.

## API

### `rehypeFluentEmoji(options?)`

Rehype plugin that scans text nodes for Unicode emoji and replaces them with Fluent Emoji `<img>` elements.

#### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `assetBase` | `string` | `'/emoji'` | Base URL or path for emoji assets |
| `ext` | `string` | `'svg'` | File extension for emoji assets |
| `className` | `string` | `'fluent-emoji'` | CSS class on generated images |
| `style` | `'color' \| 'flat' \| 'high-contrast'` | `'color'` | Fluent Emoji visual style |
| `title` | `boolean \| (emoji: string) => string \| undefined` | `true` | Title attribute behavior |

When `title` is `true` (default), CLDR emoji labels from [emojibase-data](https://github.com/milesj/emojibase) are used. If no label is available, the `title` attribute is omitted.

Set `title: false` to never emit a title. Pass a function for custom titles.

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

### Types

```ts
import type {RehypeFluentEmojiOptions} from 'rehype-fluent-emoji'
```

## Accessibility

Each emoji is replaced with a semantic `<img>` element:

- **`alt`** — the original emoji character, so assistive technology can convey the symbol
- **`title`** — a human-readable CLDR label (for example, `grinning cat`) when available
- **No `aria-hidden`** — images are not hidden from assistive technology
- **No `role="presentation"`** — images are not stripped of meaning

This keeps emoji meaningful in screen readers and tooltips without hiding content behind decorative-only semantics.

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
