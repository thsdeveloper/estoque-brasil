const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// In a monorepo, Metro watches the entire root. Exclude API-only packages
// that have temp/test dirs that break Metro's file watcher (e.g. @fastify/compress).
config.resolver.blockList = [
  /apps\/api\/.*/,
  /apps\/web\/.*/,
  /@fastify\/.*/,
];

module.exports = config;
