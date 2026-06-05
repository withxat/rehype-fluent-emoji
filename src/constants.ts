/** Default local URL prefix for self-hosted emoji assets. */
export const DEFAULT_ASSET_BASE = '/emoji'

/** Default directory for downloaded emoji assets, relative to `cwd`. */
export const DEFAULT_ASSET_OUTPUT_DIR = 'public/emoji'

/** Default remote repository for Fluent Emoji assets. */
export const DEFAULT_ASSET_REPOSITORY
	= 'https://github.com/withxat/fluentui-emoji-unicode'

/** Default git ref used when resolving `assetRepository`. */
export const DEFAULT_ASSET_REPOSITORY_BRANCH = 'webp'

/** Element tag names whose text content must not be transformed. */
export const IGNORED_ELEMENTS = new Set([
	'code',
	'pre',
	'kbd',
	'samp',
	'script',
	'style',
])
