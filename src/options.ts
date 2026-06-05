export interface RehypeFluentEmojiOptions {
	/** Base URL path for emoji assets. @default '/emoji' */
	assetBase?: string
	/** CSS class applied to generated `<span>` elements. @default 'fluent-emoji' */
	className?: string
	/** File extension for emoji assets. @default 'svg' */
	ext?: string
	/**
	 * Emit full inline styles for each emoji span.
	 * When `false`, only `--fluent-emoji-url` is set and callers should ship `FLUENT_EMOJI_CSS`.
	 * @default true
	 */
	inlineStyle?: boolean
	/** Fluent Emoji visual style. @default 'color' */
	style?: 'color' | 'flat' | 'high-contrast'
	/**
	 * Optional title resolver for generated spans.
	 * Return `undefined` to omit the title attribute.
	 */
	title?: (emoji: string) => string | undefined
}

export interface ResolvedOptions {
	assetBase: string
	className: string
	ext: string
	inlineStyle: boolean
	style: 'color' | 'flat' | 'high-contrast'
	title?: (emoji: string) => string | undefined
}

export const defaultOptions: ResolvedOptions = {
	assetBase: '/emoji',
	className: 'fluent-emoji',
	ext: 'svg',
	inlineStyle: true,
	style: 'color',
}

export function resolveOptions(
	options?: RehypeFluentEmojiOptions,
): ResolvedOptions {
	return {
		...defaultOptions,
		...options,
	}
}
