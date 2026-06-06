import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { runCli } from '../src/cli-core.js'
import { resetSyncedPathsForTests } from '../src/sync-emoji-assets.js'

describe('cli', () => {
	let tempDir = ''
	let fetchMock: ReturnType<typeof vi.fn>
	const logs: string[] = []
	const errors: string[] = []

	beforeEach(async () => {
		resetSyncedPathsForTests()
		tempDir = await mkdtemp(path.join(os.tmpdir(), 'rehype-fluent-emoji-cli-'))
		logs.length = 0
		errors.length = 0
		fetchMock = vi.fn(async () => new Response('asset', { status: 200 }))
		vi.stubGlobal('fetch', fetchMock)
	})

	afterEach(async () => {
		vi.unstubAllGlobals()
		await rm(tempDir, { force: true, recursive: true })
	})

	it('syncs emoji assets found in input files', async () => {
		await writeFile(path.join(tempDir, 'post.md'), 'Hello 😺 👍')

		const code = await runCli([
			'sync',
			'post.md',
			'--cwd',
			tempDir,
			'--out',
			'public/emoji',
		], {
			error: message => errors.push(message),
			log: message => logs.push(message),
		})

		expect(code).toBe(0)
		expect(errors).toEqual([])
		expect(logs).toEqual(['Synced 2 Fluent Emoji assets.'])
		await expect(access(path.join(tempDir, 'public/emoji/1f63a_color.webp'))).resolves.toBeUndefined()
		await expect(readFile(path.join(tempDir, 'public/emoji/1f44d_color.webp'), 'utf8')).resolves.toBe('asset')
		expect(fetchMock).toHaveBeenCalledTimes(2)
	})

	it('requires at least one input for sync', async () => {
		const code = await runCli(['sync'], {
			error: message => errors.push(message),
			log: message => logs.push(message),
		})

		expect(code).toBe(1)
		expect(errors[0]).toBe('Missing input file or directory for sync')
		expect(logs).toEqual([])
	})

	it('rejects unknown styles', async () => {
		const code = await runCli(['sync', 'post.md', '--style', 'glossy'], {
			error: message => errors.push(message),
			log: message => logs.push(message),
		})

		expect(code).toBe(1)
		expect(errors[0]).toBe('Invalid style glossy')
		expect(logs).toEqual([])
	})
})
