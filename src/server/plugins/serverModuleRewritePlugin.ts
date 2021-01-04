import Koa from 'koa';
import { init, parse } from 'es-module-lexer';
import MagicString from 'magic-string';
import { ICorePlugin } from '../';
import { resolveRelativeRequest, getDirname, bareImportRE } from '../../utils/pathUtil';
import { readBody } from '../../utils/fsUtil';

const plugin: ICorePlugin = ({ app, root }) => {
    app.use(async (ctx, next) => {
      await next();
      await init;
      const content = await readBody(ctx.body) || '';
      if (!ctx.response.is('html')) {
        const magicStr = new MagicString(content);
        const [imports] = parse(content);
        for(let i = 0;i < imports.length;i++) {
          const { s, e } = imports[i];
          const moduleId = content.slice(s, e);
          if (bareImportRE.test(moduleId)) {
            magicStr.overwrite(s, e, `/@modules/${moduleId}`);
          } else {
            magicStr.overwrite(s, e, resolveRelativeRequest(getDirname(root, ctx.url), moduleId));
          }
        }
        ctx.body = magicStr.toString();
      }
    });
};

export default plugin;
