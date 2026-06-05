import process from 'node:process'

import {
	DEFAULT_ASSET_BASE,
	DEFAULT_ASSET_OUTPUT_DIR,
	DEFAULT_ASSET_REPOSITORY,
	DEFAULT_ASSET_REPOSITORY_BRANCH,
} from './constants.js'
import { resolveAssetSource } from './resolve-asset-source.js'

export type FluentEmojiStyle = '3d' | 'color' | 'flat' | 'high-contrast'

export interface RehypeFluentEmojiOptions {
	/** Base URL for emoji assets in generated HTML. @default '/emoji' */
	assetBase?: string
	/**
	 * Download used emoji assets into this directory, relative to `cwd`.
	 * @default 'public/emoji'
	 */
	assetOutputDir?: string
	/**
	 * Remote repository link or raw asset base URL used when downloading assets.
	 * Accepts GitHub repo URLs such as `https://github.com/withxat/fluentui-emoji-unicode`.
	 * @default fluentui-emoji-unicode on GitHub
	 */
	assetRepository?: string
	/** Git ref used with `assetRepository`. @default 'webp' */
	assetRepositoryBranch?: string
	/** CSS class applied to generated `<span>` elements. @default 'fluent-emoji' */
	className?: string
	/** Project root used to resolve `assetOutputDir`. @default `process.cwd()` */
	cwd?: string
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
	assetOutputDir: string
	assetSource: string
	className: string
	cwd: string
	ext: string
	style: FluentEmojiStyle
	title?: (emoji: string) => string | undefined
}

export const defaultOptions: ResolvedOptions = {
	assetBase: DEFAULT_ASSET_BASE,
	assetOutputDir: DEFAULT_ASSET_OUTPUT_DIR,
	assetSource: resolveAssetSource(
		DEFAULT_ASSET_REPOSITORY,
		DEFAULT_ASSET_REPOSITORY_BRANCH,
	),
	className: 'fluent-emoji',
	cwd: process.cwd(),
	ext: 'webp',
	style: 'color',
}

export function resolveOptions(
	options?: RehypeFluentEmojiOptions,
): ResolvedOptions {
	const assetRepository = options?.assetRepository ?? DEFAULT_ASSET_REPOSITORY
	const assetRepositoryBranch = options?.assetRepositoryBranch
		?? DEFAULT_ASSET_REPOSITORY_BRANCH
	const style = options?.style ?? defaultOptions.style
	const ext = options?.ext ?? defaultOptions.ext

	return {
		...defaultOptions,
		...options,
		assetSource: resolveAssetSource(assetRepository, assetRepositoryBranch),
		cwd: options?.cwd ?? defaultOptions.cwd,
		ext,
		style,
	}
}
