import Koa from 'koa';
import { ICorePlugin } from '../';

const plugin: ICorePlugin = ({ app }) => {
    app.use(async (ctx, next) => {
        await next();
    });
};

export default plugin;
