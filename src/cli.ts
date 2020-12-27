#!/usr/bin/env node

import sade from 'sade';
import { runServe } from './server';

const prog = sade('v-pack');

prog
  .version('0.0.1')
  .option('--global, -g', 'An example global flag')
  .option('-c, --config', 'Provide path to custom config', 'foo.config.js');

prog
  .command('serve')
  .describe('Build the source directory. Expects an `index.js` entry file.')
  .action(() => {
    runServe();
  });

prog.parse(process.argv);