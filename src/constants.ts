/** Default Fluent Emoji asset CDN served by jsDelivr. */
export const DEFAULT_ASSET_BASE =
	'https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets'

/** Element tag names whose text content must not be transformed. */
export const IGNORED_ELEMENTS = new Set([
	'code',
	'pre',
	'kbd',
	'samp',
	'script',
	'style',
])
