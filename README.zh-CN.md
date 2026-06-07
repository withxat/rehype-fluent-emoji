# rehype-fluent-emoji

[![npm version](https://img.shields.io/npm/v/rehype-fluent-emoji.svg)](https://www.npmjs.com/package/rehype-fluent-emoji)

[English](./README.md) | 简体中文

一个 [rehype](https://github.com/rehypejs/rehype) 插件，用 [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) 视觉样式替换文本节点里的 Unicode emoji。

它运行在 HAST（rehype）阶段，支持 SSR，并输出 `<span>` 元素。原始 emoji 字符仍保留在 DOM 里，方便复制和屏幕阅读器读取。

## 特性

- 将文本节点中的 emoji 替换成 Fluent Emoji `<span>` 元素
- 通过 `assetBase` 生成可配置的资源 URL
- 提供独立的 `rehype-fluent-emoji sync` 命令，用于下载已使用的资源
- 保留原始 Unicode 字符，支持复制、选择和屏幕阅读器
- 注入一个共享的 `<style data-fluent-emoji-style>`，处理布局和选区样式
- 不处理 `<code>`、`<pre>` 等元素中的 emoji

需要 Node.js 18+。

## 安装

```sh
npm install rehype-fluent-emoji
```

## 使用

```ts
import rehype from 'rehype'
import rehypeFluentEmoji from 'rehype-fluent-emoji'

const file = await rehype()
  .data('settings', { fragment: true })
  .use(rehypeFluentEmoji)
  .process('<p>Hello 😺</p>')

console.log(String(file))
```

### 转换前

```html
<p>Hello 😺</p>
```

### 转换后

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

## 工作方式

每个 emoji 会变成一个根 `<span>`，里面有两层：

1. **文本层**：原始 Unicode 字符，保持透明但仍可选择
2. **视觉层**：覆盖在上方的 `aria-hidden` 背景图，让 Fluent Emoji 在文本选择时仍然可见

构建时，插件会：

1. 扫描可处理文本节点里的 Unicode emoji
2. 注入一个共享的 `<style data-fluent-emoji-style>` 元素
3. 将每个 emoji 替换成 `<span>`，视觉层只设置对应 emoji 的 `background-image`

视觉层上的 `pointer-events: none` 会让底下的文本层保持可选择。

## 为什么用 `<span>` 而不是 `<img>`

- **方便复制**：用户复制到的是 `😺`，不是图片 URL
- **屏幕阅读器友好**：辅助技术可以自然读取 emoji 字符
- **选择行为友好**：文本选择高亮表现接近普通文本
- **避开灯箱插件**：常见图片缩放、灯箱库会查找 `<img>`，通常会忽略 `<span>`

## 示例

### 多个 emoji

**输入**

```html
<p>Hello 😺 world 👍</p>
```

**输出**

```html
<p>
  Hello
  <span class="fluent-emoji" data-fluent-emoji>...</span>
  world
  <span class="fluent-emoji" data-fluent-emoji>...</span>
</p>
```

### 肤色和 ZWJ 序列

```html
<p>👍🏻 👨‍👩‍👧‍👦</p>
```

每个 emoji 都会变成自己的 `<span>`，使用匹配的 Fluent Emoji 资源，并在内部保留原始 Unicode 文本。

### 忽略的元素

代码类元素中的 emoji 会保持不变：

```html
<p>Visible 😺 <code>😺</code></p>
<pre><code>👍🏻</code></pre>
```

只有段落里的 emoji 会被替换；`code` 和 `pre` 块仍然保留 Unicode。

## API

### `rehypeFluentEmoji(options?)`

rehype 插件，扫描文本节点中的 Unicode emoji，并将它们替换成 Fluent Emoji `<span>` 元素。

插件只转换 HAST 并生成资源 URL。它不会在转换时下载文件，也不会写入 `public`。需要自托管资源时，请使用 `sync` 命令。

#### 选项

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `assetBase` | `string` | `'/emoji'` | 生成 HTML 中 emoji 资源的基础 URL |
| `ext` | `string` | `'webp'` | emoji 资源的文件扩展名 |
| `className` | `string` | `'fluent-emoji'` | 生成 span 上的 CSS 类名 |
| `style` | `'3d' \| 'color' \| 'flat' \| 'high-contrast'` | `'color'` | Fluent Emoji 视觉样式 |
| `title` | `(emoji: string) => string \| undefined` | `undefined` | 可选的 `title` 属性解析函数 |

### 同步资源

用 CLI 下载内容中引用到的 Fluent Emoji 资源：

```sh
rehype-fluent-emoji sync content --out public/emoji
```

本地 URL 和输出目录需要对应：

```ts
rehypeFluentEmoji({
  assetBase: '/emoji',
})
```

```sh
rehype-fluent-emoji sync content --out public/emoji
```

如果使用 CDN，可以先把文件同步到临时目录，再通过自己的资源流程上传：

```ts
rehypeFluentEmoji({
  assetBase: 'https://cdn.example.com/emoji',
})
```

```sh
rehype-fluent-emoji sync content --out .emoji-assets
```

#### sync 选项

```sh
rehype-fluent-emoji sync <file-or-directory...> [options]
```

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `--out <dir>` | `public/emoji` | 下载资源写入的目录，相对于 `--cwd` |
| `--cwd <dir>` | `process.cwd()` | 项目根目录，用于解析输入路径和 `--out` |
| `--repository <repo>` | `withxat/fluentui-emoji-unicode` | 下载资源时使用的 GitHub 仓库 URL、简写或 raw 资源基础 URL |
| `--branch <ref>` | `webp` | 当 `--repository` 不包含分支时使用的 Git ref |
| `--style <style>` | `color` | Fluent Emoji 视觉样式 |
| `--ext <ext>` | `webp` | 资源文件扩展名 |

#### 资源仓库

默认会从 [withxat/fluentui-emoji-unicode](https://github.com/withxat/fluentui-emoji-unicode) 下载资源。

`--repository` 支持：

```ts
// GitHub 仓库 URL
'https://github.com/withxat/fluentui-emoji-unicode'

// 带分支的 GitHub 仓库 URL
'https://github.com/withxat/fluentui-emoji-unicode/tree/webp'

// owner/repo 简写
'withxat/fluentui-emoji-unicode'

// 已解析的 raw 资源基础 URL
'https://raw.githubusercontent.com/withxat/fluentui-emoji-unicode/webp/assets'
```

#### 生成的资源路径

资源遵循 [fluentui-emoji-unicode](https://github.com/withxat/fluentui-emoji-unicode) 的命名约定，使用扁平的小写十六进制文件名。生成 URL 会使用标准化后的 emoji code：非肤色 emoji 会移除 `metadata.unicode` 中的所有 `fe0f`；肤色 emoji 会原样保留 `unicodeSkintones` code。sync 命令会优先尝试标准化 code，必要时再回退到完整 Unicode 序列作为下载源，同时仍写入标准化文件名：

```
{assetBase}/{unicode-code}_{style}.{ext}
```

示例：

| Emoji | 文件名 |
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

将 emoji 字符串转换成 Fluent Emoji Unicode 资源 code 的工具函数。

```ts
import { toFluentEmojiCode } from 'rehype-fluent-emoji'

toFluentEmojiCode('😺') // '1f63a'
toFluentEmojiCode('🛠️') // '1f6e0'
toFluentEmojiCode('🏳️‍⚧️') // '1f3f3-200d-26a7'
```

### `toFluentEmojiUrl(emoji, options?)`

使用与插件相同的扁平 Unicode 路径格式，将 emoji 字符串转换成 Fluent Emoji 资源 URL。

```ts
import { toFluentEmojiUrl } from 'rehype-fluent-emoji'

toFluentEmojiUrl('😺') // '/emoji/1f63a_color.webp'
toFluentEmojiUrl('👍🏻', { style: 'flat' }) // '/emoji/1f44d-1f3fb_flat.webp'
toFluentEmojiUrl('😺', { style: '3d' }) // '/emoji/1f63a_3d.webp'
```

### 视觉样式

资源会从 [fluentui-emoji-unicode](https://github.com/withxat/fluentui-emoji-unicode) 的 [`webp`](https://github.com/withxat/fluentui-emoji-unicode/tree/webp) 分支下载，那里提供四种 Fluent Emoji 样式的 WebP 文件：

- `color`：默认彩色样式
- `3d`：三维样式
- `flat`：扁平样式
- `high-contrast`：高对比度样式

```ts
rehypeFluentEmoji({
  style: '3d',
})
```

如果你托管的是其他格式，也可以继续覆盖 `ext`。

### 类型

```ts
import type { RehypeFluentEmojiOptions } from 'rehype-fluent-emoji'
```

## 框架说明

### Astro

```ts
import rehypeFluentEmoji from 'rehype-fluent-emoji'

export default defineConfig({
  markdown: {
    rehypePlugins: [rehypeFluentEmoji],
  },
})
```

确保站点会从 `public/emoji` 提供 `/emoji/...` 文件。

### Next.js / 通用静态站点

在 HTML 或 MDX 处理流程中运行插件，然后对同一批内容运行 `rehype-fluent-emoji sync`，让引用到的文件落到 `public/emoji`。

如果你的框架使用其他 public 目录，请让 `assetBase` 指向最终访问 URL，并把对应目录传给 `sync --out`：

```ts
rehypeFluentEmoji({
  assetBase: '/emoji',
})
```

```sh
rehype-fluent-emoji sync content --out static/emoji
```

## 可访问性

每个 emoji 都会变成一个 `<span>`，包含透明文本子节点和覆盖在上方的视觉背景层：

- **文本层**：emoji 字符本身，用于屏幕阅读器和复制；视觉上透明但仍可选择
- **视觉层**：覆盖在文本层上方的 Fluent Emoji 图片，让选中文本时 emoji 仍可见
- **共享 CSS**：插件注入一个 `<style data-fluent-emoji-style>`，处理布局、选区和视觉层规则
- **不使用 `role="img"`**：避免把字符替换成独立的图片对象
- **可选 `title`**：只在你提供自定义解析函数时添加

## 灯箱和图片库

因为 emoji 渲染成 `<span>` 而不是 `<img>`，它们通常不会被 lightbox、medium-zoom 或图库插件这类扫描图片的库捕获。

如果你在自定义脚本里需要显式排除，也可以使用 `data-fluent-emoji` 属性。

## 资源要求

这个插件**不内置** Fluent Emoji 资源。rehype 插件只生成 URL。请使用 `rehype-fluent-emoji sync`，将内容中用到的 emoji 从 [withxat/fluentui-emoji-unicode](https://github.com/withxat/fluentui-emoji-unicode) 下载到 `public/emoji` 或其他输出目录：

```
public/emoji/1f63a_color.webp
public/emoji/1f44d-1f3fb_color.webp
public/emoji/1f468-200d-1f469-200d-1f467-200d-1f466_color.webp
```

生成的 HTML 会引用 `/emoji/...`。

后续同步会复用已有文件，所以只有新出现的 emoji 会触发下载。

如果部署环境不会运行 sync 步骤，你可能需要提交 `public/emoji`；如果资源总是在本地或 CI 重新生成，也可以忽略它。

## SSR 支持

插件在 Node.js 中处理 HAST 树，只输出带资源 URL 的 HTML。它不会使用浏览器 API，也不会在转换时写文件，因此适合静态站点生成和服务端渲染。

## 忽略的元素

以下元素中的 emoji 永远不会被转换：

- `<code>`
- `<pre>`
- `<kbd>`
- `<samp>`
- `<script>`
- `<style>`

这会保留源代码、终端输出等场景里的字面 emoji。

## 开发

```sh
pnpm install
pnpm test
pnpm run build
```

## 作者

**rehype-fluent-emoji** © [Xat](https://github.com/withxat)，基于 [MIT](https://github.com/withxat/rehype-fluent-emoji/blob/main/LICENSE) 许可证发布。<br>
由 Xat 与贡献者共同维护（[贡献者列表](https://github.com/withxat/rehype-fluent-emoji/graphs/contributors)）。

> [Blog](https://blog.xat.sh) · GitHub [@withxat](https://github.com/withxat) · Telegram [@withxat](https://t.me/withxat) · X [@withxat](https://x.com/withxat) · Email [i@xat.sh](mailto:i@xat.sh)
