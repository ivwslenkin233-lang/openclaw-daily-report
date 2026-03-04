# 📰 OpenClaw Daily Report

[![GitHub repo](https://img.shields.io/github/v/release/ivwslenkin233-lang/openclaw-daily-report?include_prereleases)](https://github.com/ivwslenkin233-lang/openclaw-daily-report)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-skill-blue)](https://openclaw.ai)

> 智能日报生成器 - 基于价值导向的内容筛选系统

一个高度可配置的日报生成工具，集成 blogwatcher，通过多因子价值评分算法从大量订阅源中筛选高质量内容。

## ✨ 特性

- **价值导向筛选**：不按时间，按内容质量排序
- **主题偏好**：支持配置数学、AI、产品经理等主题关键词加权
- **源权重系统**：权威源自动获得更高权重
- **防刷屏机制**：每源文章数量限制，避免高频源垄断
- **时间窗口**：支持过去 N 天的内容聚合
- **透明评分**：每篇文章显示价值分数，完全可解释
- **开箱即用**：提供合理的默认配置

## 📦 安装

1. 确保已安装 [OpenClaw](https://openclaw.ai)
2. 安装 blogwatcher skill：
   ```bash
   npm install -g blogwatcher
   ```
3. 将此 `daily-report` 目录放入 OpenClaw 的 `skills/` 目录

## 🚀 快速开始

```bash
# 生成今天的日报（默认配置）
openclaw daily-report run

# 或直接运行
node skills/daily-report/index.js
```

输出文件：`memory/daily-reports/YYYY-MM-DD.md`

## ⚙️ 配置

编辑 `config.json`：

```json
{
  "maxArticles": 50,          // 全局最大文章数
  "maxPerBlog": 3,            // 每个源最多收录篇数
  "dateRange": { "daysBack": 3 },  // 回溯天数
  "includeBlogs": [],         // 白名单（空=全部）
  "excludeBlogs": [],         // 黑名单
  "blacklistKeywords": [],    // 关键词黑名单
  
  "sourceWeights": { ... },   // 源权重（1.0=标准）
  "topicWeights": { ... },    // 主题关键词加权
  "valueScoring": { ... }     // 价值评分算法配置
}
```

### 源权重

```json
"sourceWeights": {
  "Stratechery": 1.5,      // 顶级付费博客
  "MIT Technology Review": 1.3,
  "TechCrunch": 1.2,
  "Quanta Magazine": 1.4,  // 数学物理
  "36氪": 0.3               // 降低权重
}
```

### 主题关键词

```json
"topicWeights": {
  "enabled": true,
  "AI": {
    "keywords": ["AI", "机器学习", "GPT", "Claude", "LLM"],
    "boost": 0.3
  },
  "数学": {
    "keywords": ["数学", "算法", "theorem", "证明"],
    "boost": 0.25
  }
}
```

## 🎯 使用模式

### 模式 1：日常精选（默认）
```bash
openclaw daily-report run
# 过去3天，每源3篇，全局50篇
```

### 模式 2：高强度精选
```bash
openclaw daily-report run --max 30 --max-per-blog 2
# 更少但更精
```

### 模式 3：只看特定源
```json
{
  "includeBlogs": ["Stratechery", "MIT Technology Review"]
}
```

### 模式 4：周报模式
```json
{
  "dateRange": { "daysBack": 7 },
  "maxPerBlog": 5,
  "maxArticles": 100
}
```

## 🔧 命令行选项

```bash
--config <path>      # 指定配置文件（默认：config.json）
--max <number>       # 覆盖全局最大文章数
--max-per-blog <n>   # 覆盖每源最大文章数
--days-back <n>      # 覆盖回溯天数
--dry-run            # 仅打印到控制台，不写文件
--verbose            # 调试日志
```

## 📊 输出示例

<!-- 示例截图占位符 -->
<!-- 实际生成的 Markdown 报告如下所示： -->

```markdown
# 价值日报 · 2026-03-04

📊 总计: 550 篇 | 收录: 25 篇 | 来源: 13 个
⚖️ 模式: 价值筛选 (过去3天 | 每源上限 3)

## Stratechery (3 篇)

- **Technological Scale and Government Control** [2026-03-03] [价值: 1.00]
  https://stratechery.com/...

- **Anthropic and Alignment** [2026-03-02] [价值: 1.00]
  https://stratechery.com/...

## MIT Technology Review (3 篇)

- **MIT Technology Review Insiders Panel** [2026-03-03] [价值: 1.00]
  https://www.technologyreview.com/...

> 生成时间: 2026/3/4 14:42:15
> 数据来源: blogwatcher | 模式: 价值导向
```

## 🔍 价值评分算法

每篇文章的综合得分：

```
总分 = 0.5 (基础分)
     + 源权重 × 35%
     + 主题匹配 × 25%
     + 标题长度 × 15%
     + 含数字 × 10%
     + 疑问句 × -10%
     + 点击bait × -25%
```

**最高 1.0**（通过 clamp 限制）

### 因子详解

| 因子 | 权重 | 说明 | 示例 |
|------|------|------|------|
| `sourceWeight` | 35% | 源权威性（配置） | Stratechery 1.5 → +0.525 |
| `topicMatch` | 25% | 命中主题关键词 | "AI" → +0.075 |
| `titleLength` | 15% | 30-120字最优 | 适中长度 → +0.12 |
| `hasNumber` | 10% | 标题含数字加分 | "$1B" → +0.10 |
| `hasQuestion` | -10% | 疑问句可能标题党 | "What if..." → -0.10 |
| `clickbait` | -25% | 全大写/多感叹号 | "SHOCKING!!!" → -0.25 |

## 📁 文件结构

```
skills/daily-report/
├── index.js           # 主入口
├── config.json        # 配置文件
├── lib/
│   ├── parser.js      # blogwatcher 输出解析
│   ├── filter.js      # 过滤、评分、排序
│   ├── formatter.js   # Markdown 格式化
│   └── utils.js       # 工具函数
├── README.md
└── SKILL.md           # OpenClaw Skill 定义
```

## 🛠️ 开发者

- 基于 [blogwatcher](https://github.com/openclaw/blogwatcher) 订阅系统
- 使用 `gh` CLI 与 GitHub 交互
- 纯 Node.js 实现，无外部依赖（除 blogwatcher）

## 📄 License

[MIT](LICENSE) © 2025 OpenClaw Daily Report Contributors

## 🙏 致谢

感谢所有订阅源的作者和编辑们。

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute.

## 📬 Support

- Issues: https://github.com/ivwslenkin233-lang/openclaw-daily-report/issues
- Discussions: https://github.com/ivwslenkin233-lang/openclaw-daily-report/discussions

---

**提示**：首次使用前请确保 blogwatcher 已正确配置订阅源列表。

运行 `blogwatcher list` 查看你的订阅源。