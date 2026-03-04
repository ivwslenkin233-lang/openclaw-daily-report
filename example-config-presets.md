# 配置预设示例

## 1. 均衡模式（推荐默认）
```json
{
  "maxArticles": 100,
  "maxPerBlog": 5,
  "dateRange": { "daysBack": 3 },
  "sourceWeights": {
    "36氪": 0.3,
    "TechCrunch": 1.0,
    "WIRED": 1.0,
    "ScienceDaily": 1.0
  }
}
```

## 2. 高强度过滤（少于但更精）
```json
{
  "maxArticles": 30,
  "maxPerBlog": 2,
  "dateRange": { "daysBack": 5 },
  "sourceWeights": {
    "Stratechery": 2.0,
    "The Economist": 1.5,
    "Financial Times": 1.5,
    "MIT Technology Review": 1.5,
    "36氪": 0.1
  }
}
```

## 3. 仅限特定高质量源
```json
{
  "includeBlogs": [
    "Stratechery",
    "MIT Technology Review",
    "The Economist",
    "Financial Times"
  ],
  "maxPerBlog": 3,
  "maxArticles": 50,
  "sourceWeights": {}
}
```

## 4. 周报模式（7天，更多文章）
```json
{
  "maxArticles": 200,
  "maxPerBlog": 10,
  "dateRange": { "daysBack": 7 },
  "sourceWeights": {
    "36氪": 0.5
  }
}
```