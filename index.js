#!/usr/bin/env node

/**
 * Daily Report Skill - 价值导向模式
 * 基于 blogwatcher 订阅，按价值筛选文章生成日报
 */

const { spawn } = require('child_process');
const path = require('path');
const configJson = require('./config.json');
const { parseArticles } = require('./lib/parser');
const { filterArticles } = require('./lib/filter');
const { formatMarkdown } = require('./lib/formatter');
const { getToday, ensureDir, logInfo, logError, deepMerge } = require('./lib/utils');

// ============ 配置加载 ============

function loadConfig(configPath) {
  if (!configPath) return configJson;

  try {
    const custom = JSON.parse(require('fs').readFileSync(configPath, 'utf8'));
    return deepMerge(configJson, custom);
  } catch (err) {
    logError(`无法加载配置 ${configPath}`, err);
    return configJson;
  }
}

// ============ blogwatcher 调用 ============

function runBlogwatcherArticles(callback) {
  logInfo('获取文章列表（包含已读）...');
  const proc = spawn('blogwatcher', ['articles', '--all']);

  let stdout = '';
  let stderr = '';

  proc.stdout.on('data', data => stdout += data);
  proc.stderr.on('data', data => stderr += data);

  proc.on('close', code => {
    if (code !== 0) {
      callback(new Error(`blogwatcher 退出码 ${code}: ${stderr}`), null);
    } else {
      callback(null, stdout);
    }
  });

  proc.on('error', err => {
    callback(err, null);
  });
}

// ============ 输出 ============

function writeOutput(content, config, dryRun) {
  const format = config.output.format || 'markdown';
  const date = config.date || getToday();

  if (format !== 'markdown') {
    logError(`不支持的输出格式: ${format}`);
    process.exit(1);
  }

  if (dryRun) {
    console.log(content);
    return;
  }

  let outputPath = config.output.path || 'memory/daily-reports/{date}.md';

  if (outputPath === '-') {
    console.log(content);
    return;
  }

  outputPath = outputPath.replace('{date}', date);

  if (!path.isAbsolute(outputPath)) {
    outputPath = path.resolve(__dirname, '..', '..', outputPath);
  }

  ensureDir(path.dirname(outputPath));
  require('fs').writeFileSync(outputPath, content, 'utf8');
  logInfo(`报告已保存: ${outputPath}`);
}

// ============ 主流程 ============

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = loadConfig(args.config);

  // 命令行覆盖
  if (args.date) config.date = args.date;
  if (args.max !== undefined) config.maxArticles = args.max;
  if (args.maxPerBlog !== undefined) config.maxPerBlog = args.maxPerBlog;

  const reportDate = config.date || getToday();
  logInfo(`生成日报: ${reportDate} (价值导向模式)`);

  try {
    // 1. 获取文章
    runBlogwatcherArticles((err, output) => {
      if (err) {
        logError('blogwatcher 执行失败', err);
        process.exit(1);
      }

      // 2. 解析
      const allArticles = parseArticles(output);
      logInfo(`解析到 ${allArticles.length} 篇文章`);

      // 3. 过滤（日期范围、源筛选、价值评分、限制）
      const filteredArticles = filterArticles(allArticles, config);
      logInfo(`最终收录 ${filteredArticles.length} 篇`);



      if (filteredArticles.length === 0) {
        logInfo('今日无符合价值标准的文章');
        process.exit(0);
      }

      // 4. 统计
      const blogs = new Set(filteredArticles.map(a => a.blog));
      const stats = {
        total: allArticles.length,
        filtered: filteredArticles.length,
        sources: blogs.size
      };

      // 5. 按博客分组（保持排序后的分组）
      const articlesBySource = [];
      const groups = {};
      for (const article of filteredArticles) {
        const blog = article.blog || 'Unknown';
        if (!groups[blog]) groups[blog] = [];
        groups[blog].push(article);
      }
      Object.entries(groups).forEach(([blog, arts]) => {
        articlesBySource.push({ blog, articles: arts });
      });

      // 按源名称排序输出
      articlesBySource.sort((a, b) => a.blog.localeCompare(b.blog));

      // 6. 生成内容
      const content = formatMarkdown(articlesBySource, config, stats, reportDate);

      // 7. 输出
      writeOutput(content, config, args.dryRun);

      logInfo('日报生成完成 ✓');
      process.exit(0);
    });

  } catch (err) {
    logError('运行时错误', err);
    process.exit(1);
  }
}

// 参数解析
function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--date' && argv[i + 1]) {
      result.date = argv[++i];
    } else if (arg === '--max' && argv[i + 1]) {
      result.max = parseInt(argv[++i], 10);
    } else if (arg === '--max-per-blog' && argv[i + 1]) {
      result.maxPerBlog = parseInt(argv[++i], 10);
    } else if (arg === '--config' && argv[i + 1]) {
      result.config = argv[++i];
    } else if (arg === '--dry-run') {
      result.dryRun = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
价值导向日报 - 基于价值而非时间的文章收集

用法:
  daily-report [选项]

选项:
  --date <YYYY-MM-DD>    报告标题日期 (默认: 今天)
  --max <number>         全局最大文章数 (默认: 100)
  --max-per-blog <number> 每个源最多文章数 (默认: 5)
  --config <path>        自定义配置文件路径
  --dry-run              预览, 不保存文件
  --help, -h             显示此帮助信息

示例:
  # 生成今日价值日报（过去3天文章，每源最多5篇）
  daily-report

  # 限制全局100篇，每源最多3篇
  daily-report --max 100 --max-per-blog 3

  # 预览
  daily-report --dry-run

配置文件:
  skills/daily-report/config.json
      `);
      process.exit(0);
    }
  }
  return result;
}

// 启动
main();