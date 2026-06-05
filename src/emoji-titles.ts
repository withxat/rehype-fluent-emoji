import emojiData from 'emojibase-data/en/data.json' with { type: 'json' }

import { toFluentEmojiCode } from './to-fluent-emoji-code.js'

/** CLDR emoji label lookup keyed by emoji glyph. */
const labelsByEmoji = new Map<string, string>()

/** CLDR emoji label lookup keyed by lowercase hexcode. */
const labelsByHexcode = new Map<string, string>()

for (const entry of emojiData) {
	if (entry.emoji) {
		labelsByEmoji.set(entry.emoji, entry.label)
	}

	labelsByHexcode.set(entry.hexcode.toLowerCase(), entry.label)

	if (entry.skins) {
		for (const skin of entry.skins) {
			if (skin.emoji) {
				labelsByEmoji.set(skin.emoji, skin.label)
			}

			labelsByHexcode.set(skin.hexcode.toLowerCase(), skin.label)
		}
	}
}

/**
 * Resolve a CLDR emoji label for the given emoji glyph.
 * Returns `undefined` when no label is available.
 */
export function getEmojiLabel(emoji: string): string | undefined {
	const direct = labelsByEmoji.get(emoji)

	if (direct) {
		return direct
	}

	return labelsByHexcode.get(toFluentEmojiCode(emoji))
}
