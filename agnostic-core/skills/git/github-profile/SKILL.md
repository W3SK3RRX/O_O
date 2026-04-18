---
name: github-profile
description: Fetch and display GitHub user profiles with stats, repositories, and recent activity. Use when the user asks to look up a GitHub user, check someone's GitHub profile, see repos/activity of a developer, or needs GitHub user information. Triggers on keywords like "github profile", "github user", "who is @username", "repos of", "github activity".
---

# GitHub Profile

Fetch comprehensive GitHub user profile data via the GitHub API, including bio, stats, top repositories, and recent public activity.

## What It Does

Given a GitHub username, this skill:
1. Fetches the user's profile (name, bio, company, location, followers)
2. Lists their top 10 most recently updated repositories
3. Summarizes recent public activity (last 30 events)

## Requirements

- `curl` (available in virtually all environments)
- `python3` (for JSON parsing — no `jq` dependency)
- Optional: `GITHUB_TOKEN` env var for higher rate limits

## Bundled Script

The main script is `scripts/fetch-profile.sh`. It:
- Fetches profile, repos, and events **in parallel** (3 concurrent curl calls)
- Parses JSON with python3 heredoc (no external dependencies)
- Outputs formatted Markdown tables
- Automatically extracts GitHub token from git remote URL if available

### Usage

```bash
bash scripts/fetch-profile.sh <github-username>
```

### Output Format

```
## GitHub Profile: octocat

**Name:** The Octocat
**Company:** @github
**Location:** San Francisco
**Profile:** https://github.com/octocat

### Stats
| Metric | Value |
|--------|-------|
| Public Repos | 8 |
| Followers | 22034 |
| Member Since | Jan 2011 |

### Top Repositories (by recent update)
| Repository | Stars | Forks | Language | Updated |
|------------|-------|-------|----------|---------|
| Spoon-Knife | 13660 | 156628 | HTML | 12/03/2026 |
...

### Recent Activity (last 30 public events)
| Event Type | Count |
|------------|-------|
| Push | 12 |
| PullRequest | 5 |
...
```

## Installing in a Project

This skill is agnostic — it lives in this repo as reference but must be installed into each project that wants to use it as a slash command.

### Installation Steps

1. Copy the script into your project:

```bash
mkdir -p scripts/github-profile
cp <path-to-agnostic-core>/skills/git/github-profile/scripts/fetch-profile.sh \
   scripts/github-profile/fetch-profile.sh
chmod +x scripts/github-profile/fetch-profile.sh
```

2. Create the slash command at `.claude/commands/github-profile.md`:

```markdown
# GitHub Profile

Busca e exibe o perfil completo de um usuario do GitHub.

## Argumento recebido: `$ARGUMENTS`

## Instrucoes

1. Interprete `$ARGUMENTS` como o username do GitHub.
   - Se vazio, pergunte ao usuario qual username deseja consultar.
   - Se contiver `@`, remova (ex: `@octocat` -> `octocat`).
   - Se contiver URL GitHub, extraia apenas o username.

2. Execute o script:
   ```bash
   bash scripts/github-profile/fetch-profile.sh <username>
   ```

3. Apresente o resultado formatado em markdown.

4. Se falhar: mostre o erro, sugira verificar username ou definir GITHUB_TOKEN.

## Regras
- NUNCA exponha tokens GitHub no output
```

Commit both files and the command is ready as `/github-profile <username>`.

## Verification

After installing, test with:

```bash
bash scripts/github-profile/fetch-profile.sh octocat
```

Expected: Markdown table with Octocat's profile, 8 repos, and recent activity.
