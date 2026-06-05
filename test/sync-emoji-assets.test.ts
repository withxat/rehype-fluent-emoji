import { access, mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { resolveOptions } from '../src/options.js'
import {
	resetSyncedPathsForTests,
	syncEmojiAssets,
} from '../src/sync-emoji-assets.js'
import { resetResolvedFluentEmojiCodesForTests } from '../src/to-fluent-emoji-code.js'

describe('syncEmojiAssets', () => {
	let tempDir = ''
	let fetchMock: ReturnType<typeof vi.fn>

	beforeEach(async () => {
		resetSyncedPathsForTests()
		resetResolvedFluentEmojiCodesForTests()
		tempDir = await mkdtemp(path.join(os.tmpdir(), 'rehype-fluent-emoji-'))
		fetchMock = vi.fn(async () => new Response('<svg>😺</svg>', { status: 200 }))
		vi.stubGlobal('fetch', fetchMock)
	})

	afterEach(async () => {
		vi.unstubAllGlobals()
		await rm(tempDir, { force: true, recursive: true })
	})

	it('downloads used emoji assets into assetOutputDir', async () => {
		const options = resolveOptions({
			assetOutputDir: 'emoji',
			cwd: tempDir,
		})

		await syncEmojiAssets(['😺', '👍'], options)

		const catPath = path.join(tempDir, 'emoji', '1f63a_color.svg')
		const thumbsPath = path.join(tempDir, 'emoji', '1f44d_color.svg')

		await expect(access(catPath)).resolves.toBeUndefined()
		await expect(access(thumbsPath)).resolves.toBeUndefined()
		await expect(readFile(catPath, 'utf8')).resolves.toBe('<svg>😺</svg>')
		expect(fetchMock).toHaveBeenCalledTimes(2)
		expect(fetchMock).toHaveBeenCalledWith(
			'https://raw.githubusercontent.com/withxat/fluentui-emoji-unicode/main/assets/1f63a_color.svg',
		)
	})

	it('falls back to the full code when stripped FE0F assets are missing', async () => {
		fetchMock.mockImplementation(async (url: string) => {
			if (url.endsWith('/1f468-200d-2695_color.svg')) {
				return new Response('missing', { status: 404 })
			}

			if (url.endsWith('/1f468-200d-2695-fe0f_color.svg')) {
				return new Response('<svg>👨‍⚕️</svg>', { status: 200 })
			}

			return new Response('missing', { status: 404 })
		})

		const options = resolveOptions({
			assetOutputDir: 'emoji',
			cwd: tempDir,
		})

		await syncEmojiAssets(['👨‍⚕️'], options)

		const outputPath = path.join(
			tempDir,
			'emoji',
			'1f468-200d-2695-fe0f_color.svg',
		)

		await expect(access(outputPath)).resolves.toBeUndefined()
		expect(fetchMock).toHaveBeenCalledTimes(2)
		expect(fetchMock).toHaveBeenNthCalledWith(
			1,
			'https://raw.githubusercontent.com/withxat/fluentui-emoji-unicode/main/assets/1f468-200d-2695_color.svg',
		)
		expect(fetchMock).toHaveBeenNthCalledWith(
			2,
			'https://raw.githubusercontent.com/withxat/fluentui-emoji-unicode/main/assets/1f468-200d-2695-fe0f_color.svg',
		)
	})

	it('skips downloading when the asset file already exists', async () => {
		const options = resolveOptions({
			assetOutputDir: 'emoji',
			cwd: tempDir,
		})

		await syncEmojiAssets(['😺'], options)
		await syncEmojiAssets(['😺'], options)

		expect(fetchMock).toHaveBeenCalledTimes(1)
	})
})
