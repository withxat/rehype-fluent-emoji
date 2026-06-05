const GITHUB_REPO_PATTERN
	= /^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/tree\/([^/]+))?\/?$/

/** Resolve a repository link or asset base URL to a downloadable asset base URL. */
export function resolveAssetSource(
	repository: string,
	branch = 'master',
): string {
	const trimmed = repository.trim().replace(/\/$/, '')

	if (
		trimmed.includes('raw.githubusercontent.com')
		|| trimmed.endsWith('/assets')
	) {
		return trimmed
	}

	const githubMatch = trimmed.match(GITHUB_REPO_PATTERN)

	if (githubMatch) {
		const [, owner, repo, branchFromUrl] = githubMatch

		return `https://raw.githubusercontent.com/${owner}/${repo}/${branchFromUrl ?? branch}/assets`
	}

	const shorthandMatch = trimmed.match(/^([^/]+)\/([^/]+)$/)

	if (shorthandMatch) {
		const [, owner, repo] = shorthandMatch

		return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/assets`
	}

	return trimmed
}
