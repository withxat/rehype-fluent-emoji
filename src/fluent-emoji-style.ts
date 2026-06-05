export interface EmojiClassNames {
	root: string
	text: string
	visual: string
}

/** Class names derived from the root `className` option. */
export function getEmojiClassNames(className: string): EmojiClassNames {
	return {
		root: className,
		text: `${className}-text`,
		visual: `${className}-visual`,
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
	'}',
	'.fluent-emoji-visual {',
	'  position: absolute;',
	'  inset: 0;',
	'  z-index: 1;',
	'  pointer-events: none;',
	'  user-select: none;',
	'  -webkit-user-select: none;',
	'  background-image: var(--fluent-emoji-url);',
	'  background-position: center;',
	'  background-size: contain;',
	'  background-repeat: no-repeat;',
	'}',
	'.fluent-emoji-text {',
	'  display: inline-block;',
	'  position: relative;',
	'  z-index: 0;',
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
	'  color: transparent !important;',
	'  -webkit-text-fill-color: transparent !important;',
	'}',
	'.fluent-emoji[data-fluent-emoji] > .fluent-emoji-text::selection,',
	'.fluent-emoji[data-fluent-emoji] > .fluent-emoji-text::-moz-selection {',
	'  color: transparent !important;',
	'  -webkit-text-fill-color: transparent !important;',
	'}',
].join('\n')

const TEXT_INLINE_STYLE = [
	'display:inline-block',
	'position:relative',
	'z-index:0',
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
	'color:transparent!important',
	'-webkit-text-fill-color:transparent!important',
].join(';')

const VISUAL_INLINE_STYLE = [
	'position:absolute',
	'inset:0',
	'z-index:1',
	'pointer-events:none',
	'user-select:none',
	'-webkit-user-select:none',
]

/** Build the inline `style` attribute for the root emoji span. */
export function buildRootStyle(inlineStyle: boolean): string | undefined {
	if (!inlineStyle) {
		return undefined
	}

	return [
		'display:inline-block',
		'position:relative',
		`width:${EMOJI_SIZE}`,
		`height:${EMOJI_SIZE}`,
		'overflow:hidden',
		'vertical-align:middle',
	].join(';')
}

/** Build the inline `style` attribute for the Fluent Emoji visual layer. */
export function buildVisualStyle(
	url: string,
	inlineStyle: boolean,
): string {
	const cssUrl = `url(${url})`

	if (inlineStyle) {
		return [
			...VISUAL_INLINE_STYLE,
			`background:${cssUrl} center/contain no-repeat`,
		].join(';')
	}

	return `--fluent-emoji-url:${cssUrl}`
}

/** Build the inline `style` attribute for the copyable Unicode text layer. */
export function buildTextStyle(inlineStyle: boolean): string | undefined {
	return inlineStyle ? TEXT_INLINE_STYLE : undefined
}
