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

const EMOJI_SIZE = '1em'

/** Build shared stylesheet text for Fluent Emoji layout and selection. */
export function buildSharedStyle(className: string): string {
	const { root, text, visual } = getEmojiClassNames(className)

	return [
		`.${root}{position:relative}`,
		`.${text}{color:transparent;-webkit-text-fill-color:transparent;user-select:text;-webkit-user-select:text}`,
		`.${text}::selection{color:transparent;-webkit-text-fill-color:transparent}`,
		`.${visual}{position:absolute;inset:0;z-index:1;pointer-events:none;user-select:none;-webkit-user-select:none;background-position:center;background-size:${EMOJI_SIZE} ${EMOJI_SIZE};background-repeat:no-repeat}`,
	].join('')
}

/** Build the per-emoji inline `style` attribute for the visual background URL. */
export function buildVisualBackgroundStyle(url: string): string {
	return `background-image:url(${url})`
}
