import Koa from 'koa';
import os from 'os';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import http from 'http';
import jsPlugin from './plugins/jsPlugin';
import transformPlugin from './plugins/serverTransformPlugin';
import moduleRewritePlugin from './plugins/serverModuleRewritePlugin';
import moduleResolvePlugin from './plugins/serverModuleResolvePlugin';
import staticPlugin from './plugins/serverStaticPlugin';
import { cacheRead, readBody } from '../utils/fsUtil';
import { normalizePath } from '../utils/pathUtil';

const root = normalizePath(process.cwd());

const app = new Koa();

interface ITransform {
    test: (path: string) => boolean;
    transform: (code: string) => string;
}

export interface IPlugin {
    config?: (ctx: IContext) => void | unknown;
    transforms?: ITransform | ITransform[];
}

export interface IContext {
    app: Koa;
    root: string;
}

export type ICorePlugin = (ctx: IContext) => void;

export function isFunction(fun: unknown): fun is Function{
    if (fun && (fun as Record<string, unknown>).call) {
        return (fun as Record<string, unknown>).call === Function.prototype.call;
    }
    return false;
};

function createServerTransformPlugin(plugins: IPlugin[]): ICorePlugin {
    const transforms: ITransform[] = [];
    for(const plugin of plugins) {
        const { transforms: ts } = plugin;
        if (Array.isArray(ts)) {
            transforms.push(...ts);
        } else if (ts) {
            transforms.push(ts);
        }
    }
    return ({ app }) => {
        app.use(async (ctx, next) => {
            await next();
            const content = await readBody(ctx.body);
            transforms.forEach(t => {
                const { test, transform } = t;
                if (test(ctx.path)) {
                    transform(content || '');
                }
            });
            // ctx.type = 'js';
            // application/octet-stream 待处理
            ctx.body = content;
        });
    };    
};

export const runServe = () => {
    const server = http.createServer(app.callback());
    const context = {
        app,
        root,
        server,
        port: 3000,
    };
    const plugins: IPlugin[] = [jsPlugin];
    const corePlugins: ICorePlugin[] = [
        moduleRewritePlugin,
        moduleResolvePlugin,
        createServerTransformPlugin(plugins),
        staticPlugin,
    ];

    app.use(async (ctx, next) => {
        ctx.read = cacheRead.bind(null, ctx);
        ctx.moduleEntryMap = new Map();
        ctx.url = normalizePath(ctx.url);
        await next();
    });

    corePlugins.forEach((corePlugin) => {
        corePlugin(context);
    });
    plugins.forEach(plugin => {
        if(isFunction(plugin?.config)) {
            plugin?.config(context);
        }
    });
    server.on('error', (error: Error & { code: string }) => {
        if(error.code === 'EADDRINUSE') {
            server.listen(++context.port);
        }
    })
    server.listen(context.port, () => {
        console.log('Dev server running at:');
        const interfaces = os.networkInterfaces();
        Object.keys(interfaces).forEach(key => {
            interfaces[key]?.filter(_interface => _interface.family === 'IPv4')
                .map((detail) => ({
                    host: detail.address.replace('127.0.0.1', 'localhost'),
                    type: detail.address.includes('127.0.0.1') ? 'Local' : 'Network',
                })).forEach(({ type, host }) => {
                    const url = `http://${host}:${context.port}`
                    console.log(`> ${type}: ${chalk.blueBright(url)}`);
                })
        });
    });
};
