import type { ResolvedAssetSyncOptions } from './asset-sync-options.js'

import { Buffer } from 'node:buffer'
import { access, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { toFluentEmojiCodeCandidates } from './to-fluent-emoji-code.js'
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
	options: ResolvedAssetSyncOptions,
): Promise<void> {
	const sourceBase = options.assetSource.replace(/\/$/, '')
	const candidates = toFluentEmojiCodeCandidates(emoji)
	const outputFilename = toFluentEmojiFilename(emoji, options)
	const outputPath = path.join(options.cwd, options.assetOutputDir, outputFilename)
	let lastError: Error | undefined

	if (syncedPaths.has(outputPath) || await fileExists(outputPath)) {
		syncedPaths.add(outputPath)
		return
	}

	for (const code of candidates) {
		const filename = toFluentEmojiFilename(emoji, options, code)
		const sourceUrl = `${sourceBase}/${filename}`
		const response = await fetch(sourceUrl)

		if (response.ok) {
			await mkdir(path.dirname(outputPath), { recursive: true })
			await writeFile(outputPath, Buffer.from(await response.arrayBuffer()))
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
	options: ResolvedAssetSyncOptions,
): Promise<void> {
	await Promise.all(
		[...new Set(emojis)].map(emoji => downloadEmojiAsset(emoji, options)),
	)
}

/** Reset the in-process sync cache. */
export function resetSyncedPathsForTests(): void {
	syncedPaths.clear()
}
