/**
 * 通用工具函数
 */

const fs = require('fs');
const path = require('path');

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function parseDate(str) {
  return new Date(str);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function log(msg, type = 'INFO') {
  console.log(`[${type}] ${msg}`);
}

function logInfo(msg) {
  log(msg, 'INFO');
}

function logError(msg, err = null) {
  const full = err ? `${msg}: ${err.message}` : msg;
  console.error(`[ERROR] ${full}`);
}

function deepMerge(target, source) {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

module.exports = {
  getToday,
  parseDate,
  ensureDir,
  logInfo,
  logError,
  deepMerge,
  isObject
};