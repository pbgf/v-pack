import Koa from 'koa';

export default {
    config: (app: Koa) => {
        console.log(app);
    },
    transforms: {
        test: (path: string) => true,
        transform: (code: string) => {
            console.log(code);
            return code;
        }
    },
};
