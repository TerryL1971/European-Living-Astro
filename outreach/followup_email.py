"""Builds the one-time follow-up email for businesses in followups.csv.

Wording approved by Terry on 2026-11-11 (UCG session) with his later
correction: listings are free, but never promised "free forever", so the
email uses the same sentence as the List Your Business page.

Usage:
  python3 outreach/followup_email.py next 10      # JSON for the next 10 pending rows
  python3 outreach/followup_email.py mark ROW_ORDER YYYY-MM-DD   # record a sent follow-up
"""
import csv
import json
import sys
from datetime import date
from pathlib import Path

QUEUE = Path(__file__).with_name("followups.csv")
LIVE_LISTINGS = 45  # active + visible businesses on 2026-11-16; update if it changes a lot

# "A new group arrives every summer and has to find ___ all over again."
NEEDS = {
    "automotive": "a garage they can trust",
    "healthcare": "a doctor, dentist or therapist who speaks English",
    "restaurants": "favorite places to eat",
    "shopping": "shops and salons they trust",
    "home-services": "reliable help at home",
    "real-estate": "a place to live",
    "legal-business": "legal and business help in English",
    "education": "schools, lessons and tutors",
    "hbb": "local services they can rely on",
}
# Wiesbaden's U.S. community is smaller, so don't claim "tens of thousands" there.
POPULATION = {"wiesbaden": "thousands of Americans"}
DEFAULT_POPULATION = "tens of thousands of Americans"


def first_sent_text(iso: str) -> str:
    d = date.fromisoformat(iso)
    return f"{d.strftime('%B')} {d.day}"


def area_from_subject(subject: str, fallback: str) -> str:
    # "Free listing for X — American families near <AREA> are looking for you"
    marker = "American families near "
    if marker in subject and " are looking" in subject:
        return subject.split(marker, 1)[1].split(" are looking", 1)[0].strip()
    return fallback.title()


def build(row: dict) -> dict:
    business = row["business"]
    area = area_from_subject(row["original_subject"], row["base_area"])
    place = f"the {area}" if area.endswith("Community") else f"the area around {area}"
    people = POPULATION.get(row["base_area"], DEFAULT_POPULATION)
    need = NEEDS.get(row["category"], "local services they can rely on")
    subject = row["original_subject"]
    if subject and not subject.lower().startswith("re:"):
        subject = "Re: " + subject

    body = f"""Hello {row['greeting']},

I wrote to you on {first_sent_text(row['first_sent'])} about a free listing for {business} on European Living. If your first thought was "another 'free' offer that ends with an invoice," I understand. Businesses get a lot of those.

No business pays to be listed: no fee, no contract, no invoice. Nothing is ever charged without your agreement, and if hosting costs ever force a change, every listed business hears about it first and can leave owing nothing. You can check this before you reply: the "List Your Business" page and the About page at european-living.live both say it plainly, and the Services section shows the {LIVE_LISTINGS} local businesses listed there today.

Why I do this: I'm Terry, an American who has lived in Germany since 2016. When my family moved to Wiesbaden in 2017, I noticed how many Americans hardly ever left the base. They weren't uninterested. They just didn't know which local businesses spoke English or were used to working with Americans. European Living is my answer to that: a guide for Americans living near the U.S. bases, with a directory of local businesses that serve them.

What it means for {business}:

- Who sees it: {place} is home to {people}: service members, civilians and their families. A new group arrives every summer and has to find {need} all over again. Your listing stays up for the families here now and the ones still to come.
- What it shows: your name, services, address, phone, website, that you speak English, and a map link. Nothing else.
- You stay in control: nothing goes live until you confirm by email, and you can change or remove it any time with one email to me.

To join (about two minutes): https://www.european-living.live/submit-business
Or just reply "yes, list us" and I'll fill it in from your website. You'll still confirm before anything is published.

If it's not for you, no problem. I won't write again.

Kurz auf Deutsch: Ich weiß, dass viele „kostenlose" Angebote am Ende eine Rechnung bringen. Dieses nicht. European Living ist ein Verzeichnis für Amerikaner rund um die US-Standorte in Deutschland. Ein Eintrag kostet nichts: keine Gebühr, kein Vertrag, keine Rechnung, und es wird nie etwas ohne Ihre Zustimmung berechnet. Er wird erst nach Ihrer Bestätigung veröffentlicht und kann jederzeit geändert oder gelöscht werden. Eine kurze Antwort genügt.

Thank you,
Terry Lombardi
European Living, european-living.live
"""
    return {
        "order": row["order"],
        "thread_id": row["thread_id"],
        "to": row["to"],
        "cc": [c for c in row["cc"].split(";") if c],
        "subject": subject,
        "body": body,
    }


def load():
    with QUEUE.open(encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def save(rows):
    with QUEUE.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "next"
    rows = load()
    if cmd == "next":
        n = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        pending = [r for r in rows if r["status"] == "pending"]
        print(json.dumps([build(r) for r in pending[:n]], ensure_ascii=False, indent=1))
    elif cmd == "mark":
        order, status_date = sys.argv[2], sys.argv[3]
        status = sys.argv[4] if len(sys.argv) > 4 else "sent"
        for r in rows:
            if r["order"] == order:
                r["status"], r["followup_sent"] = status, status_date
        save(rows)
    else:
        sys.exit(f"unknown command {cmd}")
