"""List wiki notes added or changed since the site's last update, with the metadata needed to judge them.

Usage: python3 -I wiki_changes.py [--wiki PATH] [--since ISO] [--site PATH]
  --wiki defaults to $OBSIDIAN_VAULT_PATH.
  --since defaults to the latest `updated` time on any item in <site>/content/*.json.
Prints the ingest log lines since the cutoff, then one block per note: path, when, category, title, tags, summary, source_url, published, and an
"ai-dev" hint. Read-only: it never writes to the wiki or the site.
"""
import argparse, json, os, re, sys
from pathlib import Path

# The site is the repository this skill lives in: <repo>/.claude/skills/ai-sdlc-site-update/scripts/this.py
SITE = Path(__file__).resolve().parents[4]
from datetime import datetime, timezone

DIRS = ("sources", "concepts", "synthesis")
# Hints only. The skill decides relevance by reading the note; this just sorts likely ones first.
AI_DEV = re.compile(
    r"\b(ai|llm|agent|agentic|copilot|claude|codex|cursor|coding|code[- ]review|tdd|test|prompt|context[- ]file|"
    r"agents\.md|mcp|benchmark|swe-|vibe|pair programming|refactor|developer productivity|dora|owasp|"
    r"prompt injection|software engineering|spec)\b", re.I)

def parse_time(s):
    s = str(s).strip().strip("'\"")
    if not s:
        return None
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", s):
        s += "T00:00:00"
    try:
        t = datetime.fromisoformat(s.replace("Z", "+00:00"))
    except ValueError:
        return None
    return t if t.tzinfo else t.replace(tzinfo=timezone.utc)

def frontmatter(text):
    m = re.match(r"---\n(.*?)\n---\n", text, re.S)
    if not m:
        return {}
    fm, key, out = m.group(1), None, {}
    for line in fm.splitlines():
        km = re.match(r"^([A-Za-z_][\w-]*):\s*(.*)$", line)
        if km:
            key, val = km.group(1), km.group(2).strip()
            out[key] = "" if val in (">-", ">", "|", "|-") else val
        elif key and line.startswith("  ") and not line.strip().startswith("- "):
            out[key] = (out[key] + " " + line.strip()).strip()
    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--wiki", default=os.environ.get("OBSIDIAN_VAULT_PATH"),
                    help="the wiki (Obsidian vault) folder; defaults to $OBSIDIAN_VAULT_PATH")
    ap.add_argument("--site", default=str(SITE))
    ap.add_argument("--since")
    a = ap.parse_args()
    if not a.wiki:
        sys.exit("Where is the wiki? Pass --wiki <folder> or set OBSIDIAN_VAULT_PATH.")
    # The site's last update is the latest `updated` time on any item in content/*.json.
    if not a.since:
        stamps = [x["updated"] for f in ("recommendations", "challenges", "evidence")
                  for x in json.load(open(os.path.join(a.site, "content", f + ".json")))]
        a.since = max(stamps)
    since = parse_time(a.since)
    if not since:
        sys.exit("no valid --since time")

    notes = []
    for d in DIRS:
        root = os.path.join(a.wiki, d)
        for name in os.listdir(root):
            if not name.endswith(".md"):
                continue
            path = os.path.join(root, name)
            text = open(path, encoding="utf-8", errors="replace").read()
            fm = frontmatter(text)
            mtime = datetime.fromtimestamp(os.path.getmtime(path), timezone.utc)
            stamps = [t for t in (parse_time(fm.get("created", "")), parse_time(fm.get("updated", ""))) if t]
            # Frontmatter dates are the note's own record; mtime catches edits that forgot to bump `updated`.
            when = max(stamps + [mtime]) if stamps else mtime
            if when <= since:
                continue
            blob = " ".join([fm.get("title", ""), fm.get("tags", ""), fm.get("summary", "")])
            notes.append({
                "path": f"{d}/{name}", "when": when.isoformat(timespec="minutes"), "category": d,
                "title": fm.get("title", name[:-3]), "tags": fm.get("tags", ""), "summary": fm.get("summary", ""),
                "source_url": fm.get("source_url", ""), "published": fm.get("published", ""),
                "ai_dev_hint": bool(AI_DEV.search(blob)),
            })

    # The ingest lines say which sources drove the change; most concept and synthesis edits follow from them.
    log_lines = []
    for line in open(os.path.join(a.wiki, "log.md"), encoding="utf-8", errors="replace"):
        m = re.match(r"- \[([^\]]+)\] (INGEST|INGEST_BATCH|RESEARCH|WIKI_RESEARCH|SYNTHESIZE|WIKI_UPDATE)\b(.*)", line)
        if m and (t := parse_time(m.group(1))) and t > since:
            log_lines.append(f"[{m.group(1)}] {m.group(2)}{m.group(3)[:400].rstrip()}")
    print("ingest log since the cutoff:")
    for l in log_lines or ["(none in log.md; check Logs/<date>.md)"]:
        print("  " + l)
    print()

    notes.sort(key=lambda n: (not n["ai_dev_hint"], n["category"], n["when"]))
    print(f"since {since.isoformat(timespec='minutes')}: {len(notes)} notes "
          f"({sum(n['ai_dev_hint'] for n in notes)} with an AI-dev hint)\n")
    for n in notes:
        print(f"## {n['path']}  [{n['when']}]  hint={'yes' if n['ai_dev_hint'] else 'no'}")
        for k in ("title", "tags", "summary", "source_url", "published"):
            if n[k]:
                print(f"{k}: {n[k]}")
        print()
    latest = max((n["when"] for n in notes), default=None)
    print(f"latest change seen: {latest}")

if __name__ == "__main__":
    main()
