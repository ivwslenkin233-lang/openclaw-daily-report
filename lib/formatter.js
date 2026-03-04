/**
 * 输出格式化 - 按源分组，支持价值分数显示
 */

function groupByBlog(articles) {
  const groups = {};
  for (const article of articles) {
    if (!groups[article.blog]) {
      groups[article.blog] = [];
    }
    groups[article.blog].push(article);
  }
  return Object.entries(groups).map(([blog, articles]) => ({ blog, articles }));
}

function formatMarkdown(articlesBySource, config, stats, date) {
  const lines = [];

  lines.push(`# 价值日报 · ${date}`);
  lines.push('');

  if (config.output.includeStats) {
    lines.push(`📊 总计: ${stats.total} 篇 | 收录: ${stats.filtered} 篇 | 来源: ${stats.sources} 个`);
    if (config.valueScoring?.enabled) {
      lines.push(`⚖️ 模式: 价值筛选 (过去${config.dateRange?.daysBack || 3}天 | 每源上限 ${config.maxPerBlog || '无'})`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');

  // 源之间分隔
  for (let i = 0; i < articlesBySource.length; i++) {
    const source = articlesBySource[i];
    lines.push(`## ${source.blog} (${source.articles.length} 篇)`);
    lines.push('');

    for (const article of source.articles) {
      const dateStr = article.published ? ` [${article.published}]` : '';
      const scoreStr = article.valueScore !== undefined ? ` [价值: ${article.valueScore.toFixed(2)}]` : '';
      lines.push(`- **${escapeMarkdown(article.title)}**${dateStr}${scoreStr}`);
      lines.push(`  ${article.url}`);
      lines.push('');
    }

    if (i < articlesBySource.length - 1) {
      lines.push('---');
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('');
  lines.push(`> 生成时间: ${new Date().toLocaleString('zh-CN')}`);
  lines.push(`> 数据来源: blogwatcher | 模式: 价值导向`);

  return lines.join('\n');
}

function escapeMarkdown(text) {
  return text
    .replace(/[_*~`]/g, '\\$&')
    .replace(/>/g, '\\>');
}

module.exports = { formatMarkdown, escapeMarkdown, groupByBlog };