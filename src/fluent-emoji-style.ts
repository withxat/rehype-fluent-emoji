export interface EmojiClassNames {
	root: string
	text: string
}

/** Class names derived from the root `className` option. */
export function getEmojiClassNames(className: string): EmojiClassNames {
	return {
		root: className,
		text: `${className}-text`,
	}
}

/** Inline emoji box size, matched to the surrounding font size. */
export const EMOJI_SIZE = '1em'

/** Recommended stylesheet when `inlineStyle` is `false`. */
export const FLUENT_EMOJI_CSS = [
	'.fluent-emoji {',
	'  display: inline-block;',
	'  position: relative;',
	`  width: ${EMOJI_SIZE};`,
	`  height: ${EMOJI_SIZE};`,
	'  overflow: hidden;',
	'  vertical-align: middle;',
	'  background-image: var(--fluent-emoji-url);',
	'  background-position: center;',
	'  background-size: contain;',
	'  background-repeat: no-repeat;',
	'}',
	'.fluent-emoji-text {',
	'  display: inline-block;',
	'  width: 100%;',
	'  height: 100%;',
	'  padding: 0;',
	'  margin: 0;',
	'  border: 0;',
	'  overflow: hidden;',
	'  white-space: nowrap;',
	'  line-height: 1;',
	'  pointer-events: none;',
	'  user-select: text;',
	'  -webkit-user-select: text;',
	'  opacity: 0;',
	'  color: transparent;',
	'  -webkit-text-fill-color: transparent;',
	'}',
	'.fluent-emoji-text::selection,',
	'.fluent-emoji-text::-moz-selection {',
	'  color: transparent;',
	'  -webkit-text-fill-color: transparent;',
	'  background: transparent;',
	'}',
].join('\n')

const TEXT_INLINE_STYLE = [
	'display:inline-block',
	'width:100%',
	'height:100%',
	'padding:0',
	'margin:0',
	'border:0',
	'overflow:hidden',
	'white-space:nowrap',
	'line-height:1',
	'pointer-events:none',
	'user-select:text',
	'-webkit-user-select:text',
	'opacity:0',
	'color:transparent',
	'-webkit-text-fill-color:transparent',
].join(';')

/** Build the inline `style` attribute for the root emoji span. */
export function buildRootStyle(
	url: string,
	inlineStyle: boolean,
): string {
	const cssUrl = `url(${url})`

	if (inlineStyle) {
		return [
			'display:inline-block',
			'position:relative',
			`width:${EMOJI_SIZE}`,
			`height:${EMOJI_SIZE}`,
			'overflow:hidden',
			'vertical-align:middle',
			`background:${cssUrl} center/contain no-repeat`,
		].join(';')
	}

	return `--fluent-emoji-url:${cssUrl}`
}

/** Build the inline `style` attribute for the copyable Unicode text layer. */
export function buildTextStyle(inlineStyle: boolean): string | undefined {
	return inlineStyle ? TEXT_INLINE_STYLE : undefined
}
