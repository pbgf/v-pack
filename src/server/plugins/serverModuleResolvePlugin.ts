import { ICorePlugin } from '../';
import { moduleRE } from '../../utils/pathUtil';
import fs from 'fs';
import path from 'path';

const cacheDir = '.v_cache';
const cachePath = `./node_modules/${cacheDir}`;

const plugin: ICorePlugin = ({ app, root }) => {
  fs.mkdirSync(cachePath, { recursive: true });
  app.use(async (ctx, next) => {
    if (moduleRE.test(ctx.path)) {
      let basename = ctx.path;
      // 没有拓展名
      if (!path.extname(basename)) {
        basename = `${basename}.js`;
      }
      const modulePath = `${cachePath}/${basename}`;
      ctx.read(modulePath);
    }
    await next();
  });
};

export default plugin;
