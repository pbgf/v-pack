import Koa from 'koa';
import { ICorePlugin } from '../';

const plugin: ICorePlugin = ({ app, root }) => {
    app.use(require('koa-static')(root));
};

export default plugin;
