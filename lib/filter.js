/**
 * 文章过滤逻辑 - 价值导向模式
 */

const { getToday, parseDate } = require('./utils');

function filterByDateRange(articles, daysBack) {
  const today = new Date();
  const cutoff = new Date(today);
  cutoff.setDate(today.getDate() - daysBack);
  
  const cutoffStr = cutoff.toISOString().split('T')[0];
  
  return articles.filter(a => {
    if (!a.published) return false;
    return a.published >= cutoffStr;
  });
}

function filterByBlogsInclude(articles, includeBlogs) {
  if (!includeBlogs || includeBlogs.length === 0) return articles;
  return articles.filter(a => includeBlogs.includes(a.blog));
}

function filterByBlogsExclude(articles, excludeBlogs) {
  if (!excludeBlogs || excludeBlogs.length === 0) return articles;
  return articles.filter(a => !excludeBlogs.includes(a.blog));
}

function filterByKeywords(articles, blacklistKeywords) {
  if (!blacklistKeywords || blacklistKeywords.length === 0) return articles;
  const keywords = blacklistKeywords.map(k => k.toLowerCase());
  return articles.filter(a => {
    const titleLower = a.title.toLowerCase();
    return !keywords.some(k => titleLower.includes(k));
  });
}

function limitPerBlog(articles, maxPerBlog) {
  if (!maxPerBlog || maxPerBlog <= 0) return articles;
  
  const groups = {};
  const result = [];
  
  for (const article of articles) {
    const blog = article.blog || 'Unknown';
    if (!groups[blog]) groups[blog] = 0;
    
    if (groups[blog] < maxPerBlog) {
      result.push(article);
      groups[blog]++;
    }
  }
  
  return result;
}

function calculateValueScore(article, config) {
  const { valueScoring, sourceWeights, topicWeights } = config;
  
  let score = 0.5; // 基础分
  let debugInfo = {};
  
  // 1. 源权重
  const sourceWeight = sourceWeights[article.blog] || 0.5;
  const sourceContribution = sourceWeight * (valueScoring?.weights?.sourceWeight || 0.35);
  score += sourceContribution;
  debugInfo.source = { weight: sourceWeight, contribution: sourceContribution.toFixed(3) };
  
  // 2. 主题匹配（新增）
  let topicMatched = false;
  if (topicWeights?.enabled) {
    const titleLower = article.title.toLowerCase();
    
    for (const [topicName, config] of Object.entries(topicWeights)) {
      if (topicName === 'enabled') continue;
      
      const keywords = config.keywords || [];
      const boost = config.boost || 0.2;
      
      if (keywords.some(k => titleLower.includes(k.toLowerCase()))) {
        const topicContribution = boost * (valueScoring?.weights?.topicMatch || 0.25);
        score += topicContribution;
        debugInfo.topic = { name: topicName, boost, contribution: topicContribution.toFixed(3) };
        topicMatched = true;
        break; // 只匹配一个主题
      }
    }
  }
  
  // 3. 标题长度
  const titleLen = article.title.length;
  if (titleLen >= 30 && titleLen <= 120) {
    score += (valueScoring?.weights?.titleLength || 0.15) * 0.8;
  } else if (titleLen < 30) {
    score += (valueScoring?.weights?.titleLength || 0.15) * 0.3;
  } else {
    score += (valueScoring?.weights?.titleLength || 0.15) * 0.2;
  }
  
  // 4. 包含数字
  if (/\d+/.test(article.title)) {
    score += (valueScoring?.weights?.hasNumber || 0.10);
  }
  
  // 5. 疑问句（扣分）
  if (/[？?]/.test(article.title)) {
    score += (valueScoring?.weights?.hasQuestion || -0.10);
  }
  
  // 6. 点击bait惩罚
  if (/^[A-Z\s]+$/.test(article.title) || (article.title.match(/!/g) || []).length > 2) {
    score += (valueScoring?.weights?.clickbaitPenalty || -0.25);
  }
  
  return Math.max(0, Math.min(1, score));
}

function sortByValueScore(articles, config) {
  const sorted = [...articles];
  
  if (config.valueScoring?.enabled) {
    sorted.sort((a, b) => {
      const scoreA = a.valueScore !== undefined ? a.valueScore : calculateValueScore(a, config);
      const scoreB = b.valueScore !== undefined ? b.valueScore : calculateValueScore(b, config);
      return scoreB - scoreA; // 降序
    });
  } else {
    // 按发布日期降序
    sorted.sort((a, b) => new Date(b.published) - new Date(a.published));
  }
  
  return sorted;
}

function limitTotal(articles, max) {
  if (!max || max <= 0) return articles;
  return articles.slice(0, max);
}

// 调试：打印价值分数分布
function logScoreDistribution(articles) {
  const scores = articles.map(a => a.valueScore).sort((a, b) => b - a);
  const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
  console.log(`[评分] 分数分布 - 最高: ${scores[0].toFixed(3)}, 最低: ${scores[scores.length-1].toFixed(3)}, 平均: ${avg.toFixed(3)}`);
}

function filterArticles(articles, config) {
  let filtered = articles;

  // 1. 日期范围（过去 N 天）
  const daysBack = config.dateRange?.daysBack || 3;
  filtered = filterByDateRange(filtered, daysBack);
  console.log(`[过滤] 日期范围(过去${daysBack}天): ${filtered.length} 篇`);

  // 2. 白名单
  filtered = filterByBlogsInclude(filtered, config.includeBlogs);
  console.log(`[过滤] 白名单后: ${filtered.length} 篇`);

  // 3. 黑名单
  filtered = filterByBlogsExclude(filtered, config.excludeBlogs);
  console.log(`[过滤] 黑名单后: ${filtered.length} 篇`);

  // 4. 关键词黑名单
  filtered = filterByKeywords(filtered, config.blacklistKeywords);
  console.log(`[过滤] 关键词后: ${filtered.length} 篇`);

  // 5. 计算价值分数（在排序和截断之前）
  if (config.valueScoring?.enabled) {
    console.log(`[评分] 开始计算价值分数...`);
    filtered = filtered.map(a => {
      const score = calculateValueScore(a, config);
      // 调试：打印高价值文章
      if (score >= 0.9) {
        console.log(`  [高分] ${a.blog} | ${a.title.substring(0, 40)}... | ${score.toFixed(2)}`);
      }
      return { ...a, valueScore: score };
    });
    console.log(`[评分] 完成，共 ${filtered.length} 篇`);
  }

  // 6. 排序（按价值或时间）
  filtered = sortByValueScore(filtered, config);
  console.log(`[排序] 完成`);

  // 7. 每个源限制
  const beforePerBlog = filtered.length;
  filtered = limitPerBlog(filtered, config.maxPerBlog);
  if (config.maxPerBlog > 0 && filtered.length < beforePerBlog) {
    console.log(`[截断] 每源限制 ${config.maxPerBlog} 篇，丢弃 ${beforePerBlog - filtered.length} 篇`);
  }

  // 8. 全局数量限制
  filtered = limitTotal(filtered, config.maxArticles);

  return filtered;
}

module.exports = {
  filterArticles,
  filterByDateRange,
  filterByBlogsInclude,
  filterByBlogsExclude,
  filterByKeywords,
  limitPerBlog,
  sortByValueScore,
  calculateValueScore
};