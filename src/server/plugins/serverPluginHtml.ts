import { ICorePlugin } from '../';
import { injectScriptToHtml } from '../../utils/helpUtil';
import { readBody } from '../../utils/fsUtil';
import { clientPath } from './serverPluginClient';

const plugin: ICorePlugin = ({ app, root }) => {
  const cache = new Map();
  const rewriteHtml = (html: string) => {
    const scriptCode = `<script type="module">import "${clientPath}"</script>`;
    return injectScriptToHtml(html, scriptCode);
  };
  app.use(async (ctx, next) => {
    await next();
    if (ctx.response.is('html')) {
      if (cache.get(ctx.path)) {
        return cache.get(ctx.path)
      } else {
        const html = await readBody(ctx.body);
        ctx.body = rewriteHtml(html || '');
        cache.set(ctx.path, ctx.body);
      }
    }
  });
};

export default plugin;
