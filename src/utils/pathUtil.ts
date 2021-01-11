import path from 'path';
import resolve from 'resolve';
import chalk from 'chalk';
import fs from 'fs';
import { supportedExts } from './resolveUtil';

//非 . / 开头的模块 都是bareModule
export const bareImportRE =  /^[^\/\.]/;
export const moduleRE = /.*@modules.*/;
// export const exts = ['.js', '.jsx'];

/**
 * 补全完整路径 
 * /app => /app/index.js
 * /vue => /vue.js
 */
export function patchPath(fuzzyPath: string) {
  let fullPath = fuzzyPath;
  let realExt;
  if (fs.existsSync(fuzzyPath)) {
    const stat = fs.statSync(fuzzyPath);
    if (stat.isDirectory()) {
      // fs.statSync(fuzzyPath);
      fullPath = fuzzyPath.endsWith('/') ? fuzzyPath : `${fuzzyPath}/`;
      const hasFile = supportedExts.some(ext => {
        const possiblePath = `${fullPath}index.${ext}`;
        if (!fs.existsSync(possiblePath)) return false;
        const tempStat = fs.statSync(possiblePath);
        realExt = ext;
        return tempStat.isFile();
      })
      if (!hasFile) {
        // console.log(chalk.red(`don't exist file: ${fuzzyPath}`));
        return fuzzyPath;
      }
      return `${fullPath}index${realExt}`;
    } else if (stat.isFile()) {
      return fullPath;
    }
    return fuzzyPath;
  }
  const hasFile = supportedExts.some(ext => {
    const possiblePath = `${fullPath}.${ext}`;
    if (!fs.existsSync(possiblePath)) return false;
    const tempStat = fs.statSync(possiblePath);
      realExt = ext;
      return tempStat.isFile();
  });
  if (hasFile) {
    return `${fullPath}.${realExt}`;
  }
  console.log(chalk.red(`don't exist file: ${fuzzyPath}`));
  return fuzzyPath;
}
// path.resolve(root, reqUrl)为文件系统中完整的路径
export function getDirname(reqUrl: string) {
  // const fullPath = patchPath(path.posix.join(root, reqUrl.replace('@modules', 'node_modules'))).split(root)[1];
  return path.posix.dirname(reqUrl);
}

// 请求路径 映射成 文件系统的路径
export function requestToFile(root: string, reqPath: string): string{
  return path.posix.resolve(root, `.${reqPath}`);
};
// importer: 发出import者， importee: 被import者
export function resolveRelativeRequest(importer: string, importee: string) {
  return path.posix.resolve(importer, importee);
};
// 抹平window和posix的path差别
export function normalizePath(url: string) {
  return path.normalize(url).replace(new RegExp(`${path.sep}${path.sep}`, 'g'), path.posix.sep);
}
