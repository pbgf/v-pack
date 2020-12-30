import fs from 'fs-extra';
import { Readable } from 'stream'

const fileReadCache = new Map();

export function cacheRead (file: string): Buffer { 
  if (fileReadCache.has(file)) {
    return fileReadCache.get(file);
  }
  const buf = fs.readFileSync(file);
  fileReadCache.set(file, buf);
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