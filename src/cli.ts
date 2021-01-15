#!/usr/bin/env node

import sade from 'sade';
import path from 'path';
import fs from 'fs-extra';
import rollup from './build/rollup';
import { runServe, root, IConfig } from './server';
import { loadConfigFromBundledFile } from './utils/resolveUtil';
import chalk from 'chalk';

const prog = sade('v-pack');

prog
  .version('0.0.1')
  .option('-c, --config', 'Provide path to custom config', 'v-pack.config.js');

prog
  .command('serve')
  .describe('Build the source directory. Expects an `index.js` entry file.')
  .action(async (opts) => {
    // 解析配置文件
    const { config } = opts;
    const configFile = path.resolve(root, config);
    let cfg: IConfig | undefined;
    if (config !== 'v-pack.config.js' && !fs.existsSync(configFile)) {
      console.log(chalk.red(`explicitly specified config file don't exist`));
      return false;
    }
    try {
      cfg = require(configFile);
    } catch (err) {
      const ignored = /Cannot use import statement|Unexpected token 'export'|Must use import to load ES Module/
      if (err.code === 'ENOENT') {
        console.log(chalk.yellowBright(`v-pack.config.js don't exist`));
      }
      if (!ignored.test(err.message)) {
        throw err;
      }
    }
    if (!cfg) {
      // v-pack.config.js使用了import语法，使用rollup翻译
      const code = await rollup.build(configFile);
      cfg = loadConfigFromBundledFile(configFile, code);
    }
    runServe(cfg);
  });

prog.parse(process.argv);
