import type { FluentEmojiAssetSyncOptions } from './asset-sync-options.js'

import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import emojiRegex from 'emoji-regex-xs'

import { resolveAssetSyncOptions } from './asset-sync-options.js'
import { syncEmojiAssets } from './sync-emoji-assets.js'

export interface CliIO {
	error: (message: string) => void
	log: (message: string) => void
}

interface ParsedArgs {
	command?: string
	help: boolean
	inputs: string[]
	options: FluentEmojiAssetSyncOptions
}

const helpText = `Usage:
  rehype-fluent-emoji sync <file-or-directory...> [options]

Options:
  --out <dir>          Directory to write assets into (default: public/emoji)
  --cwd <dir>          Project root used to resolve --out (default: process.cwd())
  --repository <repo>  GitHub repo, owner/repo shorthand, or raw asset base URL
  --branch <ref>       Git ref used with --repository (default: webp)
  --style <style>      Fluent Emoji style: color, 3d, flat, high-contrast
  --ext <ext>          Asset file extension (default: webp)
  -h, --help           Show this help
`

const validStyles = new Set(['3d', 'color', 'flat', 'high-contrast'])

function readOptionValue(argv: string[], index: number, flag: string): string {
	const value = argv[index + 1]

	if (!value || value.startsWith('-')) {
		throw new Error(`Missing value for ${flag}`)
	}

	return value
}

function readStyleOption(
	argv: string[],
	index: number,
	flag: string,
): FluentEmojiAssetSyncOptions['style'] {
	const value = readOptionValue(argv, index, flag)

	if (!validStyles.has(value)) {
		throw new Error(`Invalid style ${value}`)
	}

	return value as FluentEmojiAssetSyncOptions['style']
}

function parseArgs(argv: string[]): ParsedArgs {
	const [command, ...rest] = argv
	const parsed: ParsedArgs = {
		command,
		help: false,
		inputs: [],
		options: {},
	}

	if (!command || command === '--help' || command === '-h') {
		parsed.help = true
		return parsed
	}

	for (let index = 0; index < rest.length; index += 1) {
		const arg = rest[index]!

		switch (arg) {
			case '--out': {
				parsed.options.assetOutputDir = readOptionValue(rest, index, arg)
				index += 1
				break
			}

			case '--cwd': {
				parsed.options.cwd = readOptionValue(rest, index, arg)
				index += 1
				break
			}

			case '--repository': {
				parsed.options.assetRepository = readOptionValue(rest, index, arg)
				index += 1
				break
			}

			case '--branch': {
				parsed.options.assetRepositoryBranch = readOptionValue(rest, index, arg)
				index += 1
				break
			}

			case '--style': {
				parsed.options.style = readStyleOption(rest, index, arg)
				index += 1
				break
			}

			case '--ext': {
				parsed.options.ext = readOptionValue(rest, index, arg)
				index += 1
				break
			}

			case '--help':
			case '-h': {
				parsed.help = true
				break
			}

			default: {
				if (arg.startsWith('-')) {
					throw new Error(`Unknown option ${arg}`)
				}

				parsed.inputs.push(arg)
			}
		}
	}

	return parsed
}

async function collectFiles(inputPath: string): Promise<string[]> {
	const inputStat = await stat(inputPath)

	if (inputStat.isFile()) {
		return [inputPath]
	}

	if (!inputStat.isDirectory()) {
		return []
	}

	const entries = await readdir(inputPath, { withFileTypes: true })
	const nested = await Promise.all(entries.map((entry) => {
		const entryPath = path.join(inputPath, entry.name)

		if (entry.isDirectory()) {
			return collectFiles(entryPath)
		}

		return entry.isFile() ? [entryPath] : []
	}))

	return nested.flat()
}

export async function collectEmojisFromFiles(
	inputs: string[],
	cwd = process.cwd(),
): Promise<Set<string>> {
	const emojis = new Set<string>()
	const absoluteInputs = inputs.map(input => path.resolve(cwd, input))
	const files = (await Promise.all(absoluteInputs.map(collectFiles))).flat()

	for (const file of files) {
		const contents = await readFile(file, 'utf8')

		for (const match of contents.matchAll(emojiRegex())) {
			emojis.add(match[0])
		}
	}

	return emojis
}

export async function runCli(
	argv = process.argv.slice(2),
	io: CliIO = console,
): Promise<number> {
	let parsed: ParsedArgs

	try {
		parsed = parseArgs(argv)
	}
	catch (error) {
		io.error(error instanceof Error ? error.message : String(error))
		io.error(helpText)
		return 1
	}

	if (parsed.help) {
		io.log(helpText)
		return 0
	}

	if (parsed.command !== 'sync') {
		io.error(`Unknown command ${parsed.command ?? ''}`.trim())
		io.error(helpText)
		return 1
	}

	if (parsed.inputs.length === 0) {
		io.error('Missing input file or directory for sync')
		io.error(helpText)
		return 1
	}

	try {
		const options = resolveAssetSyncOptions(parsed.options)
		const emojis = await collectEmojisFromFiles(parsed.inputs, options.cwd)

		if (emojis.size === 0) {
			io.log('No emoji found.')
			return 0
		}

		await syncEmojiAssets(emojis, options)
		io.log(`Synced ${emojis.size} Fluent Emoji asset${emojis.size === 1 ? '' : 's'}.`)

		return 0
	}
	catch (error) {
		io.error(error instanceof Error ? error.message : String(error))
		return 1
	}
}
