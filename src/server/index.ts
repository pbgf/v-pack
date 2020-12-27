import Koa from 'koa';
import jsPlugin from './plugins/jsPlugin';
import transformPlugin from './plugins/transformPlugin';

const app = new Koa();

interface ITransform {
    test: (path: string) => boolean;
    transform: (code: string) => string;
}

interface IPlugin {
    config?: (app: Koa) => void | unknown;
    transforms?: ITransform | ITransform[];
}

type ICorePlugin = (app: Koa) => void;

export function isFunction(fun: unknown): fun is Function{
    if (fun && (fun as Record<string, unknown>).call) {
        return (fun as Record<string, unknown>).call === Function.prototype.call;
    }
    return false;
};

function createServerTransformPlugin(plugins: IPlugin[]): ICorePlugin {
    return (app: Koa) => {
        app.use(() => {
            
        });
    };    
};

export const runServe = () => {
    const plugins: IPlugin[] = [jsPlugin];
    const corePlugins: ICorePlugin[] = [
        createServerTransformPlugin(plugins),
    ];
    corePlugins.forEach((corePlugin) => {
        corePlugin(app);
    });
    plugins.forEach(plugin => {
        if(isFunction(plugin?.config)) {
            plugin?.config(app);
        }
    });
    app.use(async (ctx, next) => {
        ctx.body = 'Hello World v-pack';
        await next();
    });
    app.listen(3000);
};
