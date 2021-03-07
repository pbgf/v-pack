import Koa from 'koa';
import path from 'path';
import { init, parse } from 'es-module-lexer';
import MagicString from 'magic-string';
import { ICorePlugin } from '../';
import { resolveRelativeRequest, getDirname, bareImportRE, moduleRE, patchPath } from '../utils/pathUtil';
import { readBody } from '../utils/fsUtil';

const plugin: ICorePlugin = ({ app, root }) => {
    app.use(async (ctx, next) => {
      await next();
      await init;
      const content = await readBody(ctx.body) || '';
      if (!ctx.response.is('html')) { // TODO
        const magicStr = new MagicString(content);
        const [imports] = parse(content);
        for(let i = 0;i < imports.length;i++) {
          const { s, e } = imports[i];
          const moduleId = content.slice(s, e);
          const basePath = moduleId.substring(0, moduleId.indexOf('/'));
          const aliasKey = Object.keys(ctx.alias || {}).find(key => key === basePath);
          if (aliasKey) {
            // 命中了alias
            const pathWithoutAlias = moduleId.substring(moduleId.indexOf('/'));
            const fuzzyPath: string = ctx.alias[aliasKey];
            const resultPath = patchPath(`${fuzzyPath.endsWith('/')
              ? fuzzyPath.slice(0, -1)
              : fuzzyPath
            }${pathWithoutAlias}`);
            magicStr.overwrite(s, e, resultPath.split(root)[1]);
          } else if (bareImportRE.test(moduleId)) {
            magicStr.overwrite(s, e, `/@modules/${moduleId}`);
          } else {
            // ctx.url可能为三方模块，要做特殊处理
            const resolveUrl = ctx.moduleEntryMap.get(ctx.url) || ctx.url;
            magicStr.overwrite(s, e, patchPath(
                path.posix.join(
                  root, 
                  resolveRelativeRequest(getDirname(resolveUrl), moduleId)
                )
              ).split(root)[1]
            );
          }
        }
        ctx.body = magicStr.toString();
      }
    });
};

export default plugin;
