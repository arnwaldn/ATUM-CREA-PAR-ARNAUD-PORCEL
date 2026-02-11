# Changelog Generation

Generate a changelog from git history following Keep a Changelog format:

1. Determine version range:
   - Find the latest tag: `git describe --tags --abbrev=0`
   - If no tag, use the full history: `git log --oneline`
   - Collect all commits since last tag: `git log <last-tag>..HEAD --oneline`

2. Parse commit messages:
   - Conventional Commits format: `type(scope): description`
   - Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore
   - Detect breaking changes: `BREAKING CHANGE:` in body or `!` after type

3. Categorize changes:

   ### Added
   - New features (`feat:` commits)
   - New commands, agents, or rules added
   - New API endpoints

   ### Changed
   - Modifications to existing features (`refactor:`, `perf:`)
   - Updated dependencies
   - Configuration changes

   ### Fixed
   - Bug fixes (`fix:` commits)
   - Error handling improvements
   - Regression fixes

   ### Deprecated
   - Features marked for future removal
   - API endpoints with sunset headers

   ### Removed
   - Deleted features or endpoints
   - Removed deprecated code

   ### Security
   - Security vulnerability fixes
   - Dependency security updates
   - Authentication/authorization changes

   ### Breaking Changes
   - Any change requiring user action to upgrade
   - API contract changes
   - Configuration format changes

4. Format output (Keep a Changelog):
   ```
   ## [X.Y.Z] - YYYY-MM-DD

   ### Added
   - Feature description (#PR or commit hash)

   ### Fixed
   - Bug fix description (#PR or commit hash)

   ### Breaking Changes
   - What changed and how to migrate
   ```

5. Include metadata:
   - Link each entry to the relevant commit or PR
   - Mention contributors for significant changes
   - Add migration notes for breaking changes

6. Output options:
   - Append to existing CHANGELOG.md
   - Print to stdout for review
   - Generate for a specific version range: `git log v1.0.0..v2.0.0`

7. Validate:
   - No duplicate entries
   - All breaking changes clearly documented
   - Version number follows semver based on change types:
     - MAJOR: breaking changes
     - MINOR: new features (no breaking)
     - PATCH: bug fixes only
