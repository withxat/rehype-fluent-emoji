import type { FluentEmojiStyle } from './options.js'

import process from 'node:process'

import {
	DEFAULT_ASSET_OUTPUT_DIR,
	DEFAULT_ASSET_REPOSITORY,
	DEFAULT_ASSET_REPOSITORY_BRANCH,
} from './constants.js'
import { resolveAssetSource } from './resolve-asset-source.js'

export interface FluentEmojiAssetSyncOptions {
	/**
	 * Download emoji assets into this directory, relative to `cwd`.
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
	/** Project root used to resolve `assetOutputDir`. @default `process.cwd()` */
	cwd?: string
	/** File extension for emoji assets. @default 'webp' */
	ext?: string
	/** Fluent Emoji visual style. @default 'color' */
	style?: FluentEmojiStyle
}

export interface ResolvedAssetSyncOptions {
	assetOutputDir: string
	assetSource: string
	cwd: string
	ext: string
	style: FluentEmojiStyle
}

export const defaultAssetSyncOptions: ResolvedAssetSyncOptions = {
	assetOutputDir: DEFAULT_ASSET_OUTPUT_DIR,
	assetSource: resolveAssetSource(
		DEFAULT_ASSET_REPOSITORY,
		DEFAULT_ASSET_REPOSITORY_BRANCH,
	),
	cwd: process.cwd(),
	ext: 'webp',
	style: 'color',
}

export function resolveAssetSyncOptions(
	options?: FluentEmojiAssetSyncOptions,
): ResolvedAssetSyncOptions {
	const assetRepository = options?.assetRepository ?? DEFAULT_ASSET_REPOSITORY
	const assetRepositoryBranch = options?.assetRepositoryBranch
		?? DEFAULT_ASSET_REPOSITORY_BRANCH

	return {
		...defaultAssetSyncOptions,
		...options,
		assetSource: resolveAssetSource(assetRepository, assetRepositoryBranch),
		cwd: options?.cwd ?? defaultAssetSyncOptions.cwd,
		ext: options?.ext ?? defaultAssetSyncOptions.ext,
		style: options?.style ?? defaultAssetSyncOptions.style,
	}
}
