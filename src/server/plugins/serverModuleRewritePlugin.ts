import Koa from 'koa';
import { init, parse } from 'es-module-lexer';
import MagicString from 'magic-string';
import { ICorePlugin } from '../';
import { resolveRelativeRequest } from '../../utils/pathUtil';
import { readBody } from '../../utils/fsUtil';

const plugin: ICorePlugin = ({ app }) => {
    app.use(async (ctx, next) => {
      console.log('init');
      await init;
      const content = await readBody(ctx.body) || '';
      console.log(content);
      const [imports] = parse(content);
      for(let i = 0;i < imports.length;i++) {
        const { s, e } = imports[i];
        const moduleId = content.substr(s, e);
        const magicStr = new MagicString(content);
        magicStr.overwrite(s, e, resolveRelativeRequest(ctx.url, moduleId));
        ctx.body = magicStr.toString();
      }
      await next();
    });
};

export default plugin;
