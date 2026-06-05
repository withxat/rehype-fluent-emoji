export interface RehypeFluentEmojiOptions {
	/** Base URL path for emoji assets. @default '/emoji' */
	assetBase?: string
	/** CSS class applied to generated `<img>` elements. @default 'fluent-emoji' */
	className?: string
	/** File extension for emoji assets. @default 'svg' */
	ext?: string
	/** Fluent Emoji visual style. @default 'color' */
	style?: 'color' | 'flat' | 'high-contrast'
	/**
	 * Optional title resolver for generated images.
	 * Return `undefined` to omit the title attribute.
	 */
	title?: (emoji: string) => string | undefined
}

export interface ResolvedOptions {
	assetBase: string
	className: string
	ext: string
	style: 'color' | 'flat' | 'high-contrast'
	title?: (emoji: string) => string | undefined
}

export const defaultOptions: ResolvedOptions = {
	assetBase: '/emoji',
	className: 'fluent-emoji',
	ext: 'svg',
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
