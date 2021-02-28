import fs from 'fs-extra';
import path from 'path';
import { Readable } from 'stream'
import Koa from 'koa';
import chalk from 'chalk';

const fileReadCache = new Map();

export function cacheRead (ctx: Koa.ParameterizedContext, file: string): Buffer | null { 
  if (fileReadCache.has(file)) {
    ctx.type = 'js';
    ctx.body = fileReadCache.get(file);
    return fileReadCache.get(file);
  }
  if (fs.pathExistsSync(file)) {
    const buf = fs.readFileSync(file);
    fileReadCache.set(file, buf);
    ctx.type = 'js';
    ctx.body = buf;
    return buf;
  }
  // console.log(chalk.red(`don't exist file: ${file}`));
  return null;
};

export async function readBody(
  stream: Readable | Buffer | string | null
): Promise<string | null> {
  if (stream instanceof Readable) {
    return new Promise((resolve, reject) => {
      let res = ''
      stream
        .on('data', (chunk) => (res += chunk))
        .on('error', reject)
        .on('end', () => {
          resolve(res)
        })
    })
  } else {
    return !stream || typeof stream === 'string' ? stream : stream.toString()
  }
}

export function lookupFile(
  dir: string,
  formats: string[],
  pathOnly = false
): string | undefined {
  for (const format of formats) {
    const fullPath = path.join(dir, format)
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return pathOnly ? fullPath : fs.readFileSync(fullPath, 'utf-8')
    }
  }
}
