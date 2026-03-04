/**
 * 解析 blogwatcher articles 输出
 */

function parseArticles(rawOutput) {
  const lines = rawOutput.split('\n');
  const articles = [];
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 匹配文章条目：如 [550] [new] 标题
    const match = line.match(/^\[(\d+)\]\s+(\[new\]|\[read\])?\s*(.+)$/);
    if (match) {
      if (current) articles.push(current);
      current = {
        id: match[1],
        title: match[3],
        status: match[2]?.includes('new') ? 'new' : 'read',
        blog: '',
        url: '',
        published: ''
      };
      continue;
    }

    if (!current) continue;

    // 提取 Blog
    const blogMatch = line.match(/^Blog:\s*(.+)$/);
    if (blogMatch) {
      current.blog = blogMatch[1].trim();
      continue;
    }

    // 提取 URL
    const urlMatch = line.match(/^URL:\s*(.+)$/);
    if (urlMatch) {
      current.url = urlMatch[1].trim();
      continue;
    }

    // 提取发布日期 YYYY-MM-DD
    const dateMatch = line.match(/^Published:\s*(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      current.published = dateMatch[1];
      continue;
    }
  }

  if (current) articles.push(current);

  return articles;
}

module.exports = { parseArticles };