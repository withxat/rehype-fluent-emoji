import { defineConfig } from 'tsdown'

export default defineConfig({
	clean: true,
	dts: true,
	entry: ['src/cli.ts', 'src/index.ts'],
	fixedExtension: false,
	format: ['esm'],
	outDir: 'dist',
	platform: 'node',
	sourcemap: true,
	target: 'node18',
})
