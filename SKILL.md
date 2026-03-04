---
name: daily-report
description: "智能日报生成器 - 基于价值导向的内容筛选系统"
metadata:
  {
    "openclaw":
      {
        "emoji": "📰",
        "commands": ["daily-report"],
        "requires": { "skills": ["blogwatcher"] }
      }
  }
---

# Daily Report Skill

Intelligent daily briefing generator with value-based content filtering.

## Usage

```bash
# Generate report for today
openclaw daily-report run

# With options
openclaw daily-report run --max 30 --max-per-blog 2 --dry-run
```

## Features

- ✅ Value-based scoring (not time-based)
- ✅ Topic preferences via keyword matching
- ✅ Source weights for authority
- ✅ Per-source article limits (anti-monopoly)
- ✅ Multi-day aggregation window
- ✅ Transparent scoring display

## Configuration

Edit `config.json` to customize:

```json
{
  "maxArticles": 50,
  "maxPerBlog": 3,
  "dateRange": { "daysBack": 3 },
  "sourceWeights": { "Stratechery": 1.5, ... },
  "topicWeights": { "AI": { "keywords": [...], "boost": 0.3 }, ... }
}
```

## Output

Generates Markdown report at `memory/daily-reports/{date}.md` with:

- Grouped by source
- Value score for each article
- Statistics summary
- Source attribution

## Dependencies

- blogwatcher skill (`blogwatcher articles --all`)