"""Flag study-specific wording in recommendations and challenges, which should read as practical advice.
Study names, sample sizes, scores and model names belong in the evidence `finding` instead.

Usage: python3 -I check_wording.py [--site PATH]   (exit 1 on hits)
"""
import argparse, json, re, sys
from pathlib import Path

# The site is the repository this skill lives in: <repo>/.claude/skills/ai-sdlc-site-update/scripts/this.py
SITE = Path(__file__).resolve().parents[4]

STUDY = re.compile(
    r"\d+(\.\d+)?\s*%|\b\d+(\.\d+)?x\b|\bn=\d+|\bet al\b|older models|early-2025|\bGPT|\bClaude\b(?!\.md)|\bLlama|\bGemini|"
    r"\bstudy\b|\bstudies\b|\bbenchmark|\bRCT\b|\bMETR\b|\bDORA\b|\bFaros\b|\bSWE-|\b\d+ points?\b|"
    r"\bundefended\b|\bparticipants\b|\bexperiment\b",
    re.I,
)
# Items where the flagged word is the point, not a leaked study detail.
ALLOW = {
    "run-a-production-trace-review-loop",  # 5-10% is a sampling threshold the team sets
    "spend-freed-time-with-users",  # 10% of team time is a target the team sets
    "choosing-tools-by-public-leaderboard-rankings",  # about benchmarks themselves
}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--site", default=str(SITE))
    content = Path(ap.parse_args().site) / "content"
    hits = []
    for name, fields in [("recommendations", ("title", "summary", "signals")), ("challenges", ("title", "summary"))]:
        for item in json.loads((content / f"{name}.json").read_text()):
            if item["id"] in ALLOW:
                continue
            for f in fields:
                for text in item[f] if isinstance(item[f], list) else [item[f]]:
                    m = STUDY.search(text)
                    if m:
                        hits.append(f"{name} {item['id']} {f}: '{m.group(0)}' in: {text}")
    for h in hits:
        print(h)
    print(f"{len(hits)} hits")
    sys.exit(1 if hits else 0)

if __name__ == "__main__":
    main()
