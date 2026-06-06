import {
	DEFAULT_ASSET_BASE,
} from './constants.js'

export type FluentEmojiStyle = '3d' | 'color' | 'flat' | 'high-contrast'

export interface RehypeFluentEmojiOptions {
	/** Base URL for emoji assets in generated HTML. @default '/emoji' */
	assetBase?: string
	/** CSS class applied to generated `<span>` elements. @default 'fluent-emoji' */
	className?: string
	/** File extension for emoji assets. @default 'webp' */
	ext?: string
	/**
	 * Fluent Emoji visual style.
	 * @default 'color'
	 */
	style?: FluentEmojiStyle
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
	style: FluentEmojiStyle
	title?: (emoji: string) => string | undefined
}

export const defaultOptions: ResolvedOptions = {
	assetBase: DEFAULT_ASSET_BASE,
	className: 'fluent-emoji',
	ext: 'webp',
	style: 'color',
}

export function resolveOptions(
	options?: RehypeFluentEmojiOptions,
): ResolvedOptions {
	const style = options?.style ?? defaultOptions.style
	const ext = options?.ext ?? defaultOptions.ext

	return {
		...defaultOptions,
		...options,
		ext,
		style,
	}
}
