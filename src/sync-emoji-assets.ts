import type { ResolvedOptions } from './options.js'

import { Buffer } from 'node:buffer'
import { access, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

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
	filename: string,
	options: ResolvedOptions,
): Promise<void> {
	const outputPath = path.join(options.cwd, options.assetOutputDir, filename)

	if (syncedPaths.has(outputPath) || await fileExists(outputPath)) {
		syncedPaths.add(outputPath)
		return
	}

	const sourceBase = options.assetSource.replace(/\/$/, '')
	const sourceUrl = `${sourceBase}/${filename}`
	const response = await fetch(sourceUrl)

	if (!response.ok) {
		throw new Error(
			`Failed to download Fluent Emoji asset from ${sourceUrl} (${response.status})`,
		)
	}

	await mkdir(path.dirname(outputPath), { recursive: true })
	await writeFile(outputPath, Buffer.from(await response.arrayBuffer()))
	syncedPaths.add(outputPath)
}

/** Download emoji assets used in the document into `assetOutputDir`. */
export async function syncEmojiAssets(
	emojis: Iterable<string>,
	options: ResolvedOptions,
): Promise<void> {
	const filenames = new Set(
		[...emojis].map(emoji => toFluentEmojiFilename(emoji, options)),
	)

	await Promise.all(
		[...filenames].map(filename => downloadEmojiAsset(filename, options)),
	)
}

/** Reset the in-process sync cache. */
export function resetSyncedPathsForTests(): void {
	syncedPaths.clear()
}
