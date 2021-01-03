import fs from 'fs-extra';
import { Readable } from 'stream'
import Koa from 'koa';

const fileReadCache = new Map();

export function cacheRead (ctx: Koa.ParameterizedContext, file: string): Buffer { 
  if (fileReadCache.has(file)) {
    return fileReadCache.get(file);
  }
  const buf = fs.readFileSync(file);
  fileReadCache.set(file, buf);
  if (ctx) ctx.body = buf;
  return buf;
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