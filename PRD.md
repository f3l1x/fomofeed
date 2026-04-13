# FomoFeed - Product Requirements Document

## Overview

FomoFeed generates RSS feeds for blogs and news sites that don't provide native RSS. It runs on GitHub Actions (hourly cron) and serves feeds via a lightweight web interface.

Inspired by [Olshansk/rss-feeds](https://github.com/Olshansk/rss-feeds), reimplemented in TypeScript/Bun.

## Goals

1. Generate RSS 2.0 feeds for 20+ sites that lack native RSS
2. Run anywhere — GitHub Actions (hourly) or local machine
3. Serve feeds with a browsable index page
4. Stay simple — single runtime, minimal dependencies, one command to run

## Non-Goals

- Full-text feed content (titles and summaries are sufficient)
- User accounts or authentication
- Database storage (file-based only)
- Feed reader UI (generation + index only)

## Supported Feeds

### News & Engineering Blogs

| Feed | Source |
|------|--------|
| Anthropic News | anthropic.com/news |
| Anthropic Engineering | anthropic.com/engineering |
| Anthropic Research | anthropic.com/research |
| Anthropic Red | red.anthropic.com |
| OpenAI Research | openai.com/news/research |
| X.AI News | x.ai/news |
| Google AI Blog | developers.googleblog.com |
| The Batch (deeplearning.ai) | deeplearning.ai/the-batch |

### Developer Blogs

| Feed | Source |
|------|--------|
| Claude Blog | claude.com/blog |
| Ollama Blog | ollama.com/blog |
| Cursor Blog | cursor.com/blog |
| Windsurf Blog | windsurf.com/blog |
| Dagster Blog | dagster.io/blog |
| Surge AI Blog | surgehq.ai/blog |
| Thinking Machines | thinkingmachines.ai/blog |

### Personal Blogs

| Feed | Source |
|------|--------|
| Paul Graham Essays | paulgraham.com/articles.html |
| Chander Ramesh | chanderramesh.com/writing |
| Hamel Husain | hamel.dev |

### Changelogs

| Feed | Source |
|------|--------|
| Claude Code Changelog | github.com/.../CHANGELOG.md |
| Windsurf Changelog | windsurf.com/changelog |
| Windsurf Next Changelog | windsurf.com/changelog/windsurf-next |

### GitHub Releases

| Feed | Repository |
|------|------------|
| Claude Code | anthropics/claude-code |
| OpenCode | anomalyco/opencode |
| Cline | cline/cline |
| Aider | paul-gauthier/aider |
| Continue | continuedev/continue |
| Tabby | TabbyML/tabby |
| Ollama | ollama/ollama |
| OpenAI Codex | openai/codex |

## Features

### Feed Generation

- Incremental by default — only fetches new content
- Full mode available to re-scrape everything
- Per-feed generation for testing individual sources
- Append-only archive preserves complete history across runs

### Web Server

- Browsable index page listing all feeds with subscribe links
- Feeds organized by category: news, blogs, changelogs, releases
- Individual feeds at `/feeds/{category}/{id}.xml`
- Aggregated category feeds at `/feeds/{category}.xml`
- Health check endpoint

### GitHub Actions

- Hourly cron + manual dispatch
- Commits updated feed XML files automatically
- Only feed output is committed (caches are ephemeral)

## Success Criteria

1. All feeds generate valid, parseable RSS 2.0 XML
2. Feeds work in standard readers (Feedly, NetNewsWire, etc.)
3. Hourly GitHub Actions workflow runs reliably
4. Web server serves all feeds with correct content types
5. Works identically on CI and local machines
