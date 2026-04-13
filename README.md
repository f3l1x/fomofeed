# FomoFeed

RSS feed generator for blogs and news sites that don't offer native RSS feeds. Runs on [Bun](https://bun.sh), generates standard RSS 2.0 XML, and serves feeds via a lightweight web server.

## Feeds

28 feeds organized into three categories. Each category has an aggregated feed combining all items. Company feeds aggregate all sources from a single company.

### News (`/feeds/news.xml`)

| Feed | Source | Company | Strategy |
|------|--------|---------|----------|
| Claude Blog | claude.com/blog | Anthropic | paginated |
| Google AI Blog | developers.googleblog.com | Google | paginated |
| Anthropic News | anthropic.com/news | Anthropic | browser |
| Anthropic Engineering | anthropic.com/engineering | Anthropic | browser |
| Anthropic Research | anthropic.com/research | Anthropic | browser |
| Anthropic Red Blog | red.anthropic.com | Anthropic | browser |
| X.AI News | x.ai/news | xAI | browser |

### Blogs (`/feeds/blogs.xml`)

| Feed | Source | Company | Strategy |
|------|--------|---------|----------|
| Ollama Blog | ollama.com/blog | Ollama | static |
| Paul Graham Essays | paulgraham.com/articles.html | | static |
| Chander Ramesh Writing | chanderramesh.com/writing | | static |
| Thinking Machines Blog | thinkingmachines.ai/blog | | static |
| Hamel Husain's Blog | hamel.dev | | static |
| The Batch - DeepLearning.AI | deeplearning.ai/the-batch | | static |
| Windsurf Blog | windsurf.com/blog | Windsurf | browser |
| Cursor Blog | cursor.com/blog | Cursor | paginated |
| Dagster Blog | dagster.io/blog | | paginated |
| Surge AI Blog | surgehq.ai/blog | | paginated |

### Changelogs (`/feeds/changelogs.xml`)

| Feed | Source | Company | Strategy |
|------|--------|---------|----------|
| Windsurf Editor Changelog | windsurf.com/changelog | Windsurf | static |
| Windsurf Next Changelog | windsurf.com/changelog/windsurf-next | Windsurf | static |
| Claude Code Changelog | github.com/.../CHANGELOG.md | Anthropic | browser |
| Claude Code Releases | github.com/anthropics/claude-code | Anthropic | github-release |
| OpenCode Releases | github.com/anomalyco/opencode | | github-release |
| Cline Releases | github.com/cline/cline | | github-release |
| Aider Releases | github.com/paul-gauthier/aider | | github-release |
| Continue Releases | github.com/continuedev/continue | | github-release |
| Tabby Releases | github.com/TabbyML/tabby | | github-release |
| Ollama Releases | github.com/ollama/ollama | Ollama | github-release |
| OpenAI Codex Releases | github.com/openai/codex | OpenAI | github-release |

### Company feeds (`/feeds/company/{name}.xml`)

| Company | Feeds | URL |
|---------|-------|-----|
| Anthropic | 8 | `/feeds/company/anthropic.xml` |
| Cursor | 1 | `/feeds/company/cursor.xml` |
| Google | 1 | `/feeds/company/google.xml` |
| Ollama | 2 | `/feeds/company/ollama.xml` |
| OpenAI | 1 | `/feeds/company/openai.xml` |
| Windsurf | 3 | `/feeds/company/windsurf.xml` |
| xAI | 1 | `/feeds/company/xai.xml` |

## Setup

```sh
make install  # bun install
```

## Usage

```sh
# Generate all feeds
make generate

# Generate a single feed
make generate FEED=anthropic-news

# Full regeneration (clears cache)
make generate-full

# Start the web server
make serve
make serve PORT=8080

# Run tests
make test
```

## Inspiration

Inspired by [Olshansk/rss-feeds](https://github.com/Olshansk/rss-feeds).
