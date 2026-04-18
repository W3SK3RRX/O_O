#!/usr/bin/env bash
# fetch-profile.sh — Fetch and display a GitHub user profile in Markdown
# Usage: bash fetch-profile.sh <github-username>
# Optional: set GITHUB_TOKEN env var for higher API rate limits

set -euo pipefail

USERNAME="${1:-}"

if [[ -z "$USERNAME" ]]; then
  echo "Usage: $0 <github-username>" >&2
  exit 1
fi

# Strip leading @ if present
USERNAME="${USERNAME#@}"

# ── Token resolution ──────────────────────────────────────────────────────────
# 1. Prefer GITHUB_TOKEN env var
# 2. Try to extract token embedded in git remote URL (https://<token>@github.com/...)
if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  REMOTE_URL="$(git remote get-url origin 2>/dev/null || true)"
  if [[ "$REMOTE_URL" =~ https://([^@]+)@github\.com ]]; then
    GITHUB_TOKEN="${BASH_REMATCH[1]}"
  fi
fi

# Build auth header
AUTH_HEADER=""
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  AUTH_HEADER="Authorization: token ${GITHUB_TOKEN}"
fi

# ── Temp files ────────────────────────────────────────────────────────────────
TMP_DIR="$(mktemp -d)"
PROFILE_FILE="$TMP_DIR/profile.json"
REPOS_FILE="$TMP_DIR/repos.json"
EVENTS_FILE="$TMP_DIR/events.json"

cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

# ── Parallel curl calls ───────────────────────────────────────────────────────
BASE="https://api.github.com"
CURL_OPTS=(-s --max-time 15)
[[ -n "$AUTH_HEADER" ]] && CURL_OPTS+=(-H "$AUTH_HEADER")
CURL_OPTS+=(-H "Accept: application/vnd.github.v3+json")
CURL_OPTS+=(-H "User-Agent: fetch-profile-sh")

curl "${CURL_OPTS[@]}" "$BASE/users/$USERNAME"                                 \
  -o "$PROFILE_FILE" &
curl "${CURL_OPTS[@]}" "$BASE/users/$USERNAME/repos?sort=updated&per_page=10"  \
  -o "$REPOS_FILE" &
curl "${CURL_OPTS[@]}" "$BASE/users/$USERNAME/events/public?per_page=30"       \
  -o "$EVENTS_FILE" &
wait

# ── Validate responses ────────────────────────────────────────────────────────
for f in "$PROFILE_FILE" "$REPOS_FILE" "$EVENTS_FILE"; do
  if [[ ! -s "$f" ]]; then
    echo "Error: failed to fetch data from GitHub API (empty response)." >&2
    echo "Check the username or define GITHUB_TOKEN for higher rate limits." >&2
    exit 1
  fi
  # Detect API error messages
  if python3 -c "import json,sys; d=json.load(open('$f')); sys.exit(0 if 'message' not in d else 1)" 2>/dev/null; then
    : # ok
  else
    MSG="$(python3 -c "import json; d=json.load(open('$f')); print(d.get('message','Unknown error'))" 2>/dev/null || echo "Unknown error")"
    echo "Error from GitHub API: $MSG" >&2
    exit 1
  fi
done

# ── Python3 parsing & output ──────────────────────────────────────────────────
python3 - "$PROFILE_FILE" "$REPOS_FILE" "$EVENTS_FILE" << 'PYEOF'
import json
import sys
from datetime import datetime
from collections import Counter

profile_file, repos_file, events_file = sys.argv[1], sys.argv[2], sys.argv[3]

with open(profile_file) as f:
    p = json.load(f)
with open(repos_file) as f:
    repos = json.load(f)
with open(events_file) as f:
    events = json.load(f)

# ── Header ────────────────────────────────────────────────────────────────────
print(f"## GitHub Profile: {p.get('login', 'N/A')}\n")

if p.get("name"):
    print(f"**Name:** {p['name']}")
if p.get("bio"):
    print(f"**Bio:** {p['bio']}")
if p.get("company"):
    print(f"**Company:** {p['company']}")
if p.get("location"):
    print(f"**Location:** {p['location']}")
print(f"**Profile:** https://github.com/{p.get('login', '')}")
print()

# ── Stats table ───────────────────────────────────────────────────────────────
created = p.get("created_at", "")
if created:
    try:
        dt = datetime.strptime(created, "%Y-%m-%dT%H:%M:%SZ")
        member_since = dt.strftime("%b %Y")
    except ValueError:
        member_since = created[:7]
else:
    member_since = "N/A"

print("### Stats")
print("| Metric | Value |")
print("|--------|-------|")
print(f"| Public Repos | {p.get('public_repos', 0)} |")
print(f"| Followers | {p.get('followers', 0)} |")
print(f"| Following | {p.get('following', 0)} |")
print(f"| Public Gists | {p.get('public_gists', 0)} |")
print(f"| Member Since | {member_since} |")
print()

# ── Top repositories table ────────────────────────────────────────────────────
print("### Top Repositories (by recent update)")
print("| Repository | Stars | Forks | Language | Updated |")
print("|------------|-------|-------|----------|---------|")

for repo in repos:
    if not isinstance(repo, dict):
        continue
    name = repo.get("name", "N/A")
    stars = repo.get("stargazers_count", 0)
    forks = repo.get("forks_count", 0)
    lang = repo.get("language") or "—"
    updated_raw = repo.get("updated_at", "")
    if updated_raw:
        try:
            dt = datetime.strptime(updated_raw, "%Y-%m-%dT%H:%M:%SZ")
            updated = dt.strftime("%d/%m/%Y")
        except ValueError:
            updated = updated_raw[:10]
    else:
        updated = "N/A"
    print(f"| {name} | {stars} | {forks} | {lang} | {updated} |")

print()

# ── Recent activity table ─────────────────────────────────────────────────────
print("### Recent Activity (last 30 public events)")
print("| Event Type | Count |")
print("|------------|-------|")

event_counts: Counter = Counter()
for ev in events:
    if not isinstance(ev, dict):
        continue
    raw_type = ev.get("type", "Unknown")
    # Trim "Event" suffix for readability (e.g. "PushEvent" -> "Push")
    label = raw_type.replace("Event", "") if raw_type.endswith("Event") else raw_type
    event_counts[label] += 1

if event_counts:
    for event_type, count in event_counts.most_common():
        print(f"| {event_type} | {count} |")
else:
    print("| (no recent public activity) | — |")

PYEOF
