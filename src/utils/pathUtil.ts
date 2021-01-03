import path from 'path';
import chalk from 'chalk';
import fs from 'fs';

//非 . / 开头的模块 都是bareModule
export const bareImportRE =  /^[^\/\.]/;
export const moduleRE = /.*@modules.*/;
export const exts = ['.js', '.jsx'];

export function getFullPath(fuzzyPath: string) {
  const stat = fs.statSync(fuzzyPath);
  let fullPath = fuzzyPath;
  let realExt;
  if (stat.isDirectory()) {
    // fs.statSync(fuzzyPath);
    fullPath = fuzzyPath.endsWith('/') ? fuzzyPath : `${fuzzyPath}/`;
    const hasFile = exts.some(ext => {
      const tempStat = fs.statSync(`${fullPath}index${ext}`);
      realExt = ext;
      return tempStat.isFile();
    })
    if (!hasFile) {
      console.log(chalk.red(`don't exist file: ${fuzzyPath}`));
      return '';
    }
    return `${fullPath}index${realExt}`;
  } else if (stat.isFile()) {
    return fullPath;
  }
  const hasFile = exts.some(ext => {
    const tempStat = fs.statSync(`${fullPath}${ext}`);
      realExt = ext;
      return tempStat.isFile();
  });
  if (hasFile) {
    return `${fullPath}${realExt}`;
  }
  console.log(chalk.red(`don't exist file: ${fuzzyPath}`));
  return '';
}

export function getPrevPath(root: string, reqUrl: string) {
  const fullPath = getFullPath(path.join(root, reqUrl)).split(root)[1];
  return fullPath.slice(0, fullPath.lastIndexOf('/') + 1);
}

// 请求路径 映射成 文件系统的路径
export function requestToFile(root: string, reqPath: string): string{
  return path.resolve(root, `.${reqPath}`);
};
// importer: 发出import者， importee: 被import者
export function resolveRelativeRequest(importer: string, importee: string) {
  return path.resolve(importer, importee);
};
