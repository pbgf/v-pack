import { ICorePlugin } from '../';
import { readBody } from '../utils/fsUtil';

const plugin: ICorePlugin = ({ app, root, watcher, utils }) => {
  const cache = new Map();
  const rewriteCss = (content: string) => {
    return `import { updateStyle } from "/node_modules/v-pack/client/index.js";
const css = "${content}";
updateStyle("${Date.now()}", css);
export default css;`
  };
  watcher.on('change', (filePath) => {
    console.log(filePath);
    // utils.send({
    //   type: 'style-update',
    //   path: '',
    //   changeSrcPath: '',
    //   timestamp: new Date().valueOf(),
    // });
  });
  app.use(async (ctx, next) => {
    await next();
    if (ctx.response.is('css')) {
      if (cache.get(ctx.path)) {
        ctx.body = cache.get(ctx.path)
      } else {
        const content = await readBody(ctx.body);
        ctx.body = rewriteCss(content || '');
        ctx.type = 'js';
        cache.set(ctx.path, ctx.body);
      }
    }
  });
};

export default plugin;
