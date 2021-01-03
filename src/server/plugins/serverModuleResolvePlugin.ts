import { ICorePlugin } from '../';
import { moduleRE } from '../../utils/pathUtil';
import fs from 'fs';

const cacheDir = '$v_cache';
const cachePath = `./node_modules/${cacheDir}`;

const plugin: ICorePlugin = ({ app, root }) => {
  fs.mkdirSync(cachePath, { recursive: true });
  app.use(async (ctx, next) => {
    if (moduleRE.test(ctx.path)) {
      
    }
    await next();
  });
};

export default plugin;
