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
	 * Title attribute for generated images.
	 * - `true`: use CLDR emoji labels from emojibase-data
	 * - `false`: omit the title attribute
	 * - function: custom resolver per emoji
	 * @default true
	 */
	title?: ((emoji: string) => string | undefined) | boolean
}

export interface ResolvedOptions {
	assetBase: string
	className: string
	ext: string
	style: 'color' | 'flat' | 'high-contrast'
	title: ((emoji: string) => string | undefined) | boolean
}

export const defaultOptions: ResolvedOptions = {
	assetBase: '/emoji',
	className: 'fluent-emoji',
	ext: 'svg',
	style: 'color',
	title: true,
}

export function resolveOptions(
	options?: RehypeFluentEmojiOptions,
): ResolvedOptions {
	return {
		...defaultOptions,
		...options,
	}
}
