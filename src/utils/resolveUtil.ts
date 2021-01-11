import resolve from 'resolve';
import fs from 'fs-extra';
import path from 'path';

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
