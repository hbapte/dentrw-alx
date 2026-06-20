# Contributing

## Getting started

```bash
git clone https://github.com/hbapte/dentrw-alx.git
cd dentrw-alx
bun install          # also installs Husky git hooks via prepare script
cp .env.example .env.local # fill in your values
bun run dev          # http://localhost:3000
```

## Stack

React 18

## Commit format

This repo enforces [Conventional Commits](https://www.conventionalcommits.org/) via commitlint. Every commit message must follow:

```
<type>: <short description>
```

Allowed types: `feat` `fix` `docs` `style` `refactor` `perf` `test` `chore` `ci` `build` `revert` `wip` `lint`

Examples:

```
feat: add appointment reminder emails
fix: correct role check on dentist portal
chore: update dependencies
```

## Git hooks (automatic)

| Hook         | What it does                                      |
| ------------ | ------------------------------------------------- |
| `pre-commit` | Formats + lints only staged files via lint-staged |

Hooks are installed automatically when you run `bun install`.

## Running checks manually

```bash
bun run lint         # oxlint
bun run format       # prettier --check
bun run test         # vitest run
bun run knip         # dead code / unused exports
```

## Pull requests

- Keep PRs focused on one thing — open multiple small PRs rather than one large one
- CI must pass before merging (lint, format, tests)
- Use the PR template in `.github/pull_request_template.md`
