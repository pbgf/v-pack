import resolve from 'resolve';
import fs from 'fs-extra';
import path from 'path';
import hook from 'node-hook';

export const supportedExts = ['mjs', 'js', 'ts', 'jsx', 'tsx', 'json'];
export const mainFields = ['module', 'jsnext', 'jsnext:main', 'browser', 'main'];

export const resolveFrom = (root: string, id: string) =>
  resolve.sync(id, {
    basedir: root,
    extensions: supportedExts,
    // necessary to work with pnpm
    // preserveSymlinks: isRunningWithYarnPnp || false
  });

// 解析node_modules中的三方模块
export const resolveNodeModule = (root: string, moduleName: string) => {
  let entryPath = '';
  const pkgPath = resolveFrom(root, `${moduleName}/package.json`);
  if (fs.existsSync(pkgPath)) {
    const pkg = fs.readJSONSync(pkgPath);
    mainFields.some(mainField => {
      const theEntryPath = path.resolve(path.dirname(pkgPath), pkg[mainField]);
      if (pkg[mainField] && fs.existsSync(theEntryPath)) {
        entryPath = theEntryPath;
        return true;
      }
      return false;
    });
  }
  return {
    releativePath: entryPath.split(root)[1],
    entryPath,
  };
};

// vite实现方法
// 重新修改js文件的引入规则 如果文件名匹配上了 vite.config.js 则调用编译方法，编译rollup翻译好的commonjs版本，删除require的缓存 ，下次require则返回这个新版本
// 但require.extensions已经被废弃了 stackoverflow上提供了几个替代方法： node-hook、pirates, node-hook就是module.__extensions的封装
export function loadConfigFromBundledFile(
  fileName: string,
  bundledCode: string
): Record<string, string> {
  const extension = path.extname(fileName)
  const loadFileSpecifyCode = (source: string, filename: string) => {
    if (filename === fileName) {
      return bundledCode;
    }
    return source;
  };
  hook.hook(extension, loadFileSpecifyCode);
  delete require.cache[fileName]
  const raw = require(fileName)
  const code = raw.__esModule ? raw.default : raw
  hook.unhook(extension);
  return code
};

function resolveCOnfig () {

};
