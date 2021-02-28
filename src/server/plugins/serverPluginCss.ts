import { ICorePlugin } from '../';
import { readBody } from '../../utils/fsUtil';

const plugin: ICorePlugin = ({ app, root }) => {
  const cache = new Map();
  const rewriteCss = (content: string) => {
    return `
      import { updateStyle } from "/vite/client"
      const css = "${content}";
      updateStyle("${Date.now()}", css);
      export default css;
    `
  };
  app.use(async (ctx, next) => {
    await next();
    if (ctx.response.is('css')) {
      if (cache.get(ctx.path)) {
        return cache.get(ctx.path)
      } else {
        const content = await readBody(ctx.path);
        ctx.body = rewriteCss(content || '');
        ctx.type = 'js';
        cache.set(ctx.path, ctx.body);
      }
    }
  });
};

export default plugin;
