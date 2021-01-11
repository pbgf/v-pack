import { ICorePlugin } from '../';
import { moduleRE } from '../../utils/pathUtil';
import { resolveNodeModule, mainFields } from '../../utils/resolveUtil';
import fs from 'fs-extra';
import path from 'path';

const cacheDir = '.v_cache';
const cachePath = `./node_modules/${cacheDir}`;

const plugin: ICorePlugin = ({ app, root }) => {
  fs.mkdirSync(cachePath, { recursive: true });
  app.use(async (ctx, next) => {
    if (moduleRE.test(ctx.path)) {
      ctx.type = 'js';
      const basename = ctx.path.split('@modules/')[1];
      let fileName;
      // 没有拓展名
      if (!path.extname(basename)) {
        fileName = `${basename}.js`;
      }
      const modulePath = `${cachePath}/${fileName}`;
      if(!ctx.read(modulePath)) {
        // 没有进行缓存，直接到node_modules读取
        // 应该首先读取 ['module', 'jsnext', 'jsnext:main'] 等，最后再读取 main 指向的文件
        // 如果直接 resolveFrom 模块，则会默认读取package.json中main指向的文件，就不是esm模块文件了
        const { entryPath, releativePath } = resolveNodeModule(root, basename);
        ctx.moduleEntryMap.set(ctx.url, releativePath);
        ctx.read(entryPath);
      }
    } 
    else if (ctx.path.length > 1 && !path.extname(ctx.path)) {
      // 路径没有后缀 尝试读取文件夹下的package.json
      const fileName = path.join(root, `${ctx.path}/package.json`);
      if (fs.existsSync(fileName)) {
        const pkg = fs.readJSONSync(fileName);
        mainFields.some(field => {
          if (pkg[field]) {
            ctx.read(path.resolve(path.dirname(fileName), pkg[field]));
            return true;
          }
          return false;
        });
      }
    }
    await next();
  });
};

export default plugin;
