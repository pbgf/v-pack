import { ICorePlugin } from '../';
import { injectScriptToHtml } from '../utils/helpUtil';
import { readBody } from '../utils/fsUtil';

export const clientPath = '/node_modules/v-pack/client/index.js';

const plugin: ICorePlugin = ({ app, port }) => {
  let clientCode = '';
  app.use(async (ctx, next) => {
    await next();
    if (ctx.path === clientPath) {
      // 由node端来往client注入port变量
      clientCode = await readBody(ctx.body) || '';
      ctx.body = clientCode.replace('__HMR_PORT__', `${port}`);
    }
  });
};

export default plugin;
