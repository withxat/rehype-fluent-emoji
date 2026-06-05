import { describe, expect, it } from 'vitest'

import { resolveAssetSource } from '../src/resolve-asset-source.js'

describe('resolveAssetSource', () => {
	it('resolves a GitHub repository URL', () => {
		expect(
			resolveAssetSource('https://github.com/withxat/fluentui-emoji-unicode'),
		).toBe(
			'https://raw.githubusercontent.com/withxat/fluentui-emoji-unicode/master/assets',
		)
	})

	it('resolves a GitHub repository URL with branch', () => {
		expect(
			resolveAssetSource(
				'https://github.com/withxat/fluentui-emoji-unicode/tree/main',
			),
		).toBe(
			'https://raw.githubusercontent.com/withxat/fluentui-emoji-unicode/main/assets',
		)
	})

	it('resolves owner/repo shorthand', () => {
		expect(resolveAssetSource('withxat/fluentui-emoji-unicode', 'main')).toBe(
			'https://raw.githubusercontent.com/withxat/fluentui-emoji-unicode/main/assets',
		)
	})

	it('keeps an existing raw asset base URL', () => {
		expect(
			resolveAssetSource(
				'https://raw.githubusercontent.com/withxat/fluentui-emoji-unicode/master/assets',
			),
		).toBe(
			'https://raw.githubusercontent.com/withxat/fluentui-emoji-unicode/master/assets',
		)
	})
})
