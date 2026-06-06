function toRawFluentEmojiCode(emoji: string): string {
	return Array.from(emoji)
		.map(character => character.codePointAt(0)!.toString(16))
		.join('-')
}

/**
 * Candidate asset codes for an emoji, ordered for fluentui-emoji-unicode lookup.
 *
 * Non-skintone assets strip every `fe0f` from `metadata.unicode`. Skintone
 * assets use `unicodeSkintones` as-is, so the full code is tried second.
 */
export function toFluentEmojiCodeCandidates(emoji: string): string[] {
	const raw = toRawFluentEmojiCode(emoji)
	const stripped = raw
		.split('-')
		.filter(code => code !== 'fe0f')
		.join('-')

	return [...new Set([stripped, raw])]
}

/**
 * Convert an emoji string to a Fluent Emoji Unicode asset code.
 *
 * @example
 * toFluentEmojiCode('😺') // '1f63a'
 * toFluentEmojiCode('🛠️') // '1f6e0'
 * toFluentEmojiCode('👍🏻') // '1f44d-1f3fb'
 * toFluentEmojiCode('👨‍👩‍👧‍👦') // '1f468-200d-1f469-200d-1f467-200d-1f466'
 * toFluentEmojiCode('🇺🇸') // '1f1fa-1f1f8'
 * toFluentEmojiCode('🏳️‍⚧️') // '1f3f3-200d-26a7'
 */
export function toFluentEmojiCode(emoji: string): string {
	return toFluentEmojiCodeCandidates(emoji)[0]!
}
