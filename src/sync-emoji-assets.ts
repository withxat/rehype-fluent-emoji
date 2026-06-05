import type { ResolvedOptions } from './options.js'

import { Buffer } from 'node:buffer'
import { access, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import {
	setResolvedFluentEmojiCode,
	toFluentEmojiCodeCandidates,
} from './to-fluent-emoji-code.js'
import { toFluentEmojiFilename } from './to-fluent-emoji-url.js'

const syncedPaths = new Set<string>()

async function fileExists(filePath: string): Promise<boolean> {
	try {
		await access(filePath)
		return true
	}
	catch {
		return false
	}
}

async function downloadEmojiAsset(
	emoji: string,
	options: ResolvedOptions,
): Promise<void> {
	const sourceBase = options.assetSource.replace(/\/$/, '')
	const candidates = toFluentEmojiCodeCandidates(emoji)
	let lastError: Error | undefined

	for (const code of candidates) {
		const filename = toFluentEmojiFilename(emoji, options, code)
		const outputPath = path.join(options.cwd, options.assetOutputDir, filename)

		if (syncedPaths.has(outputPath) || await fileExists(outputPath)) {
			setResolvedFluentEmojiCode(emoji, code)
			syncedPaths.add(outputPath)
			return
		}

		const sourceUrl = `${sourceBase}/${filename}`
		const response = await fetch(sourceUrl)

		if (response.ok) {
			await mkdir(path.dirname(outputPath), { recursive: true })
			await writeFile(outputPath, Buffer.from(await response.arrayBuffer()))
			setResolvedFluentEmojiCode(emoji, code)
			syncedPaths.add(outputPath)
			return
		}

		lastError = new Error(
			`Failed to download Fluent Emoji asset from ${sourceUrl} (${response.status})`,
		)
	}

	throw lastError ?? new Error(`Failed to download Fluent Emoji asset for ${emoji}`)
}

/** Download emoji assets used in the document into `assetOutputDir`. */
export async function syncEmojiAssets(
	emojis: Iterable<string>,
	options: ResolvedOptions,
): Promise<void> {
	await Promise.all(
		[...new Set(emojis)].map(emoji => downloadEmojiAsset(emoji, options)),
	)
}

/** Reset the in-process sync cache. */
export function resetSyncedPathsForTests(): void {
	syncedPaths.clear()
}
