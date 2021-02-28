import { ICorePlugin } from '../';
import { injectScriptToHtml } from '../../utils/helpUtil';
import { readBody } from '../../utils/fsUtil';

const publicPath = '/vite';

const plugin: ICorePlugin = ({ app, root }) => {
  app.use(async (ctx, next) => {
    if (ctx.path.startsWith(publicPath)) {
      ctx.path = ctx.path.replace(publicPath, '/node_modules/vite/src');
    }
    await next();
  });
};

export default plugin;
