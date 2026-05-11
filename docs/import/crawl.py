#!/usr/bin/env python3
"""
Crawl Invoca developer docs and save as clean markdown.

Setup (first time):
    uv sync
    uv run crawl4ai-setup

Run:
    uv run python crawl.py
"""

import asyncio
from pathlib import Path
from urllib.parse import urlparse

from crawl4ai import AsyncWebCrawler, CrawlerRunConfig
from crawl4ai.deep_crawling import BFSDeepCrawlStrategy
from crawl4ai.deep_crawling.filters import DomainFilter, FilterChain, URLPatternFilter
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator
from crawl4ai.content_filter_strategy import PruningContentFilter

BASE_URL = "https://developers.invoca.net/en/2019-02-01/index.html"
BASE_PATH = "/en/2019-02-01/"
OUTPUT_DIR = Path(__file__).parent.parent / "output"


def url_to_output_path(url: str) -> Path:
    path = urlparse(url).path
    rel = path[len(BASE_PATH):] if path.startswith(BASE_PATH) else path.lstrip("/")
    if not rel or rel.endswith("/"):
        rel = rel + "index.html"
    return (OUTPUT_DIR / rel).with_suffix(".md")


async def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    strategy = BFSDeepCrawlStrategy(
        max_depth=5,
        include_external=False,
        max_pages=500,
        filter_chain=FilterChain([
            DomainFilter(allowed_domains=["developers.invoca.net"]),
            URLPatternFilter(patterns=["*/en/2019-02-01/*"]),
        ]),
    )

    config = CrawlerRunConfig(
        deep_crawl_strategy=strategy,
        excluded_tags=["nav", "header", "footer", "aside"],
        markdown_generator=DefaultMarkdownGenerator(
            content_filter=PruningContentFilter(threshold=0.48)
        ),
        exclude_external_links=True,
        word_count_threshold=10,
    )

    print(f"Crawling {BASE_URL} ...")
    async with AsyncWebCrawler() as crawler:
        results = await crawler.arun(BASE_URL, config=config)

    if not isinstance(results, list):
        results = [results]

    saved = 0
    for result in results:
        if not result.success:
            print(f"  SKIP (failed): {result.url}")
            continue
        md = result.markdown
        content = (md.fit_markdown or md.raw_markdown) if md else None
        if not content:
            print(f"  SKIP (no content): {result.url}")
            continue
        out_path = url_to_output_path(result.url)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(content)
        print(f"  {out_path.relative_to(OUTPUT_DIR.parent)}")
        saved += 1

    print(f"\nDone — {saved} files written to {OUTPUT_DIR}")


if __name__ == "__main__":
    asyncio.run(main())
