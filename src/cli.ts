#!/usr/bin/env node
import process from 'node:process'

import { runCli } from './cli-core.js'

runCli().then((code) => {
	process.exitCode = code
}, (error) => {
	console.error(error instanceof Error ? error.message : String(error))
	process.exitCode = 1
})
