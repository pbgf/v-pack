import Koa from 'koa';
import os from 'os';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import http from 'http';
import chokidar, { FSWatcher } from 'chokidar'
import jsPlugin from './plugins/jsPlugin';
import { IMessage } from './plugins/serverPluginHmr';
import transformPlugin from './plugins/serverTransformPlugin';
import moduleRewritePlugin from './plugins/serverModuleRewritePlugin';
import moduleResolvePlugin from './plugins/serverModuleResolvePlugin';
import serverPluginHtml from './plugins/serverPluginHtml';
import serverPublicPathPlugin from './plugins/serverPublicPathPlugin';
import serverPluginHmr from './plugins/serverPluginHmr';
import serverPluginClient from './plugins/serverPluginClient';
import serverPluginCss from './plugins/serverPluginCss';
import staticPlugin from './plugins/serverStaticPlugin';
import { cacheRead, readBody } from './utils/fsUtil';
import { normalizePath } from './utils/pathUtil';

export const root = normalizePath(process.cwd());

const app = new Koa();
const alias: Record<string, string> = {
    '@': path.resolve(root, './src'),
};

interface ITransform {
    test: (path: string) => boolean;
    transform: (code: string) => string;
}

export interface IPlugin {
    config?: (ctx: IContext) => void | unknown;
    transforms?: ITransform | ITransform[];
}

export interface IOptimizeDeps {
    auto?: boolean; // default false
    include?: string[];
    exclude?: string[];
}

export interface IConfig {
    mode?: string;
    alias?: Record<string, string>;
    optimizeDeps?: IOptimizeDeps;
}

export interface IUtils {
    send?: (message: IMessage) => void;
}

export interface IContext {
    app: Koa;
    root: string;
    port: number;
    server: http.Server;
    watcher: FSWatcher;
    utils: IUtils;
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
            ctx.body = content;
        });
    };    
};

const responseHandlerPlugin = () => {

};

export const runServe = (config: IConfig) => {
    const server = http.createServer(app.callback());
    const watcher = chokidar.watch(root, {
        ignored: ['**/node_modules/**', '**/.git/**'],
        ignoreInitial: true,
    });
    const context = {
        app,
        root,
        server,
        port: 3000,
        utils: {},
        watcher
    };
    const plugins: IPlugin[] = [jsPlugin];
    const corePlugins: ICorePlugin[] = [
        serverPluginHmr,
        serverPublicPathPlugin,
        moduleRewritePlugin,
        moduleResolvePlugin,
        createServerTransformPlugin(plugins),
        serverPluginClient,
        serverPluginHtml,
        serverPluginCss,
        staticPlugin,
    ];
    const { mode, alias: configAlias = {} } = config;
    app.use(async (ctx, next) => {
        ctx.read = cacheRead.bind(null, ctx);
        ctx.moduleEntryMap = new Map();
        Object.assign(alias, configAlias);
        ctx.alias = alias;
        ctx.server = server;
        ctx.url = normalizePath(ctx.url);
        await next();
    });
    // 启动server
    server.on('error', (error: Error & { code: string }) => {
        if(error.code === 'EADDRINUSE') {
            server.listen(++context.port);
        }
    })
    server.on('listening', () => {
        corePlugins.forEach((corePlugin) => {
            corePlugin(context);
        });
        plugins.forEach(plugin => {
            if(isFunction(plugin?.config)) {
                plugin?.config(context);
            }
        });
    });
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
