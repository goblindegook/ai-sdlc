"""Check the built site (dist/) for the rules the owner set. Run after `npx astro build`.

Usage: python3 -I check_site.py [--site PATH]   (exit 1 on any failure)
Checks: every internal evidence/recommendation/trial/challenge link resolves; only the Evidence page links
out to external sites; no page mentions the wiki; no "N recommendations"-style counts in visible text; every Evidence
entry is cited by something.
"""
import argparse, html, os, re, sys
from pathlib import Path

# The site is the repository this skill lives in: <repo>/.claude/skills/ai-sdlc-site-update/scripts/this.py
SITE = Path(__file__).resolve().parents[4]

PAGES = {"overview": "index.html", "recommendations": "recommendations/index.html", "trials": "trials/index.html",
         "challenges": "challenges/index.html", "evidence": "evidence/index.html"}

def visible(h):
    h = re.sub(r"<(script|style)\b.*?</\1>", " ", h, flags=re.S)
    return html.unescape(re.sub(r"<[^>]+>", " ", h))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--site", default=str(SITE))
    a = ap.parse_args()
    dist = os.path.join(a.site, "dist")
    pages = {k: open(os.path.join(dist, v), encoding="utf-8").read() for k, v in PAGES.items()}
    ids = {k: set(re.findall(r'\bid="([^"]+)"', h)) for k, h in pages.items()}
    fails = []

    for k, h in pages.items():
        for target, anchor in re.findall(r'href="(?:/[^"/#]+)?/(recommendations|trials|challenges|evidence)/#([^"]+)"', h):
            if anchor not in ids[target]:
                fails.append(f"{k}: broken link to /{target}/#{anchor}")
        if k != "evidence":
            ext = [u for u in re.findall(r'href="(https?://[^"]+)"', h) if "fonts.g" not in u]
            if ext:
                fails.append(f"{k}: {len(ext)} external links (only Evidence may link out), e.g. {ext[0]}")
        text = visible(h)
        if re.search(r"\bwiki\b", text, re.I):
            fails.append(f"{k}: mentions the wiki")
        m = re.search(r"(?<!Top )\b\d+\s+(recommendations|practices|challenges|questions|sources|trials|items)\b", text, re.I)
        if m:
            fails.append(f"{k}: shows a count ('{m.group(0)}')")

    # The Evidence page lists cited sources only: every entry needs a "Used in" list.
    for m in re.finditer(r"<details\b[^>]*\bid=\"([^\"]+)\"(.*?)</details>", pages["evidence"], flags=re.S):
        if "Used in" not in m.group(2):
            fails.append(f"evidence: {m.group(1)} is cited by nothing (remove it from evidence.json)")

    for f in fails:
        print("FAIL", f)
    print("ok" if not fails else f"{len(fails)} problems")
    sys.exit(1 if fails else 0)

if __name__ == "__main__":
    main()
