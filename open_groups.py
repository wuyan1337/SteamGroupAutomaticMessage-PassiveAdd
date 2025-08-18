
"""
QQ1730249
Open Steam group links in the default web browser every N seconds.
Default file: groups.txt
Usage example:
  python open_groups.py --file groups.txt --delay 4              # open in new tab (default)
"""
import argparse
import time
import webbrowser
from pathlib import Path

def iter_links(path: Path):
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            url = line.strip()
            if not url or url.startswith("#"):
                continue
            yield url

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--file", default="groups.txt", help="Path to text file with one URL per line")
    ap.add_argument("--delay", type=float, default=4.0, help="Seconds between opening links")
    ap.add_argument("--new-window", action="store_true", help="Open each link in a new window (default: new tab)")
    args = ap.parse_args()

    path = Path(args.file)
    if not path.exists():
        print(f"[!] File not found: {path.resolve()}")
        return

    opener = webbrowser.open_new if args.new_window else webbrowser.open_new_tab

    try:
        for i, url in enumerate(iter_links(path), 1):
            print(f"[{i}] Opening: {url}")
            opener(url)
            if i > 0:
                time.sleep(max(0.0, args.delay))
        print("Done.")
    except KeyboardInterrupt:
        print("\nStopped by user.")

if __name__ == "__main__":
    main()
