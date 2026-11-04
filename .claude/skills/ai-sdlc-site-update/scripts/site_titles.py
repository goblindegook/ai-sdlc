"""Print what the site holds now, straight from content/*.json: every recommendation (with its ring), challenge and
open question, with id, topic and topics, plus (with --full) signals and cited evidence titles.

Usage: python3 -I site_titles.py [--site PATH] [--topic SLUG] [--full]
Read-only.
"""
import argparse, json
from pathlib import Path

# The site is the repository this skill lives in: <repo>/.claude/skills/ai-sdlc-site-update/scripts/this.py
SITE = Path(__file__).resolve().parents[4]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--site", default=str(SITE))
    ap.add_argument("--topic")
    ap.add_argument("--full", action="store_true")
    a = ap.parse_args()
    c = Path(a.site) / "content"
    load = lambda n: json.loads((c / f"{n}.json").read_text())
    evidence = {e["id"]: e for e in load("evidence")}
    for name, title in [("recommendations", "title"), ("challenges", "title"), ("questions", "question")]:
        print(f"# {name}")
        for x in load(name):
            if a.topic and a.topic not in x["topics"]:
                continue
            ring = f"[{x['ring']}] " if "ring" in x else ""
            print(f"- {ring}{x[title]}   id={x['id']} topic={x['topic']} topics={','.join(x['topics'])} updated={x['updated']}")
            if a.full:
                for s in x.get("signals", []):
                    print(f"    watch: {s}")
                for e in x["evidence"]:
                    print(f"    evidence: {evidence[e]['title']}  ({e})")
        print()

if __name__ == "__main__":
    main()
