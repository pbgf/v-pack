import Koa from 'koa';
import { IPlugin } from '../';

const plugin: IPlugin = {
    config: ({ app }) => {
        // console.log('app');
    },
    transforms: {
        test: (path: string) => true,
        transform: (code: string) => {
            // console.log(code);
            return code;
        }
    },
};

export default plugin;
