import { DEFAULT_ASSET_BASE } from './constants.js'

export interface RehypeFluentEmojiOptions {
	/** Base URL for emoji assets. @default jsDelivr CDN for fluentui-emoji-unicode */
	assetBase?: string
	/** CSS class applied to generated `<span>` elements. @default 'fluent-emoji' */
	className?: string
	/** File extension for emoji assets. @default 'svg' */
	ext?: string
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
	style: 'color' | 'flat' | 'high-contrast'
	title?: (emoji: string) => string | undefined
}

export const defaultOptions: ResolvedOptions = {
	assetBase: DEFAULT_ASSET_BASE,
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
