"""
Reddit Growth Radar & Lead Finder for LedgerSnap
================================================
Monitors live Reddit discussions across accounting, QuickBooks, and bookkeeping
subreddits for users asking how to convert bank statement PDFs to QBO or Excel.
Generates compliant, value-first, anti-ban response drafts automatically.
"""

import os
import sys
import json
import time
import requests
from datetime import datetime, timezone

SEARCH_QUERIES = [
    "convert bank statement to qbo",
    "pdf bank statement to quickbooks",
    "pdf to qbo",
    "bank statement to excel converter",
    "quickbooks import bank statement pdf",
    "bank statement pdf reconciliation"
]

TARGET_SUBREDDITS = [
    "quickbooks",
    "Bookkeeping",
    "Accounting",
    "smallbusiness",
    "Entrepreneur",
    "SaaS",
    "SideProject"
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 LedgerGrowthEngine/1.1"
}


def search_reddit_leads(max_results_per_query=8):
    leads = []
    seen_ids = set()

    for query in SEARCH_QUERIES:
        url = f"https://www.reddit.com/search.json?q={requests.utils.quote(query)}&sort=new&limit={max_results_per_query}"
        try:
            resp = requests.get(url, headers=HEADERS, timeout=10)
            if resp.status_code != 200:
                continue

            data = resp.json()
            posts = data.get("data", {}).get("children", [])
            for post in posts:
                p = post.get("data", {})
                pid = p.get("id")
                sub = p.get("subreddit", "")

                if pid in seen_ids:
                    continue
                seen_ids.add(pid)

                # Filter or flag relevant subreddits
                is_target_sub = any(ts.lower() == sub.lower() for ts in TARGET_SUBREDDITS)

                created_utc = p.get("created_utc", 0)
                dt = datetime.fromtimestamp(created_utc, tz=timezone.utc).strftime('%Y-%m-%d %H:%M:%S')

                leads.append({
                    "id": pid,
                    "title": p.get("title", ""),
                    "subreddit": f"r/{sub}",
                    "is_priority_sub": is_target_sub,
                    "author": p.get("author", "[deleted]"),
                    "score": p.get("score", 0),
                    "num_comments": p.get("num_comments", 0),
                    "url": f"https://reddit.com{p.get('permalink', '')}",
                    "created_utc": dt,
                    "preview": (p.get("selftext", "")[:350] + "...") if len(p.get("selftext", "")) > 350 else p.get("selftext", "")
                })
            time.sleep(1) # respectful rate limiting
        except Exception as e:
            print(f"[!] Error fetching query '{query}': {e}", file=sys.stderr)

    return leads


def generate_suggested_reply(lead):
    """
    Generates a high-value, anti-ban response draft tailored to the post context.
    Strictly adheres to Reddit anti-spam rules:
    - Answers the question technically first.
    - Does NOT drop raw naked affiliate/tracking links.
    - Mentions LedgerSnap naturally as a solution/project.
    """
    title_lower = lead['title'].lower()

    if "qbo" in title_lower or "quickbooks" in title_lower:
        return (
            "QuickBooks Online doesn't natively accept raw PDF bank statements—it requires "
            "either a Web Connect (.QBO) file or a formatted 3/4-column CSV. \n\n"
            "If your bank only provides older archives in PDF, you have two options:\n"
            "1. Manual extraction: Open in Excel/Acrobat and copy-paste rows, but watch out for date formats (YYYY-MM-DD) and debit/credit sign inversion.\n"
            "2. Automated converter: You can use **LedgerSnap** (https://ledger-snap.com). It deterministically parses the PDF tables, verifies mathematical checksums (Opening + Credits - Debits = Closing), and formats it directly into a certified Intuit .QBO file that imports in 1 click without column mapping. It processes in volatile RAM so confidential client financial data is never saved or retained."
        )
    elif "excel" in title_lower or "csv" in title_lower:
        return (
            "When extracting bank statement PDFs to Excel/CSV, standard copy-paste usually breaks multiline transaction descriptions and splits dates across columns.\n\n"
            "A fast way to solve this cleanly is using **LedgerSnap** (https://ledger-snap.com). It extracts tables with bounding-box parsing, balances the debits/credits automatically, and gives you a pre-formatted .xlsx with frozen headers and sum formulas (or 1-click .QBO if you plan to import into QuickBooks)."
        )
    else:
        return (
            "A common bottleneck with bank statements is that banks stop offering .QBO or .OFX downloads after 90 days, leaving you with only PDF archives.\n\n"
            "If you need to batch convert statements into QuickBooks, check out **LedgerSnap** (https://ledger-snap.com)—it's specifically built for bookkeepers and CPAs to convert PDF statements into certified .QBO Web Connect files with zero data retention."
        )


def main():
    print("=" * 60)
    print("LedgerSnap Reddit Growth Radar — Scanning Reddit Leads...")
    print("=" * 60)

    leads = search_reddit_leads()
    print(f"[+] Found {len(leads)} potential discussions.\n")

    # Sort priority subreddits first, then by date
    leads.sort(key=lambda x: (x['is_priority_sub'], x['created_utc']), reverse=True)

    output_path = os.path.join(os.path.dirname(__file__), "reddit_leads_report.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(leads, f, indent=2, ensure_ascii=False)

    md_output_path = os.path.join(os.path.dirname(__file__), "reddit_leads_action_list.md")
    with open(md_output_path, "w", encoding="utf-8") as f:
        f.write("# 🎯 Reddit High-Intent Leads & Ready-to-Post Replies for LedgerSnap\n\n")
        f.write(f"*Last Updated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}*\n\n")

        for i, lead in enumerate(leads[:15], 1):
            f.write(f"### {i}. [{lead['title']}]({lead['url']})\n")
            f.write(f"- **Subreddit**: `{lead['subreddit']}` | **Date**: {lead['created_utc']} | **Comments**: {lead['num_comments']}\n")
            if lead['preview']:
                f.write(f"- **Context**: *\"{lead['preview'].replace(chr(10), ' ')}\"*\n")
            f.write("\n**📋 Recommended Reply (Anti-Ban, Value-First):**\n```markdown\n")
            f.write(generate_suggested_reply(lead))
            f.write("\n```\n\n---\n\n")

    print(f"[✓] Successfully generated report:")
    print(f"    - JSON: {output_path}")
    print(f"    - Action Markdown: {md_output_path}")


if __name__ == "__main__":
    main()

