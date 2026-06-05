/**
 * Convert an emoji string to a Fluent Emoji Unicode asset code.
 *
 * Uses `Array.from` to iterate Unicode code points, preserving FE0F and ZWJ.
 *
 * @example
 * toFluentEmojiCode('😺') // '1f63a'
 * toFluentEmojiCode('👍🏻') // '1f44d-1f3fb'
 * toFluentEmojiCode('👨‍👩‍👧‍👦') // '1f468-200d-1f469-200d-1f467-200d-1f466'
 * toFluentEmojiCode('🇺🇸') // '1f1fa-1f1f8'
 * toFluentEmojiCode('🏳️‍⚧️') // '1f3f3-fe0f-200d-26a7-fe0f'
 */
export function toFluentEmojiCode(emoji: string): string {
	return Array.from(emoji)
		.map(character => character.codePointAt(0)!.toString(16))
		.join('-')
}
