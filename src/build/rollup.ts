import path from 'path';
import Module from 'module';
import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';

async function build(input: string) {
  const bundle = await rollup({
    // vite: id.slice(-5, id.length) === '.json', why? 什么情况下需要引入json？
    external: (id: string) => (id[0] !== '.' && !path.isAbsolute(id)),
    input,
    treeshake: false,
    // rollup默认不会把第三方依赖打进来，以前是import 还是 import，如果需要把第三方依赖一起放进bundle则需要该插件
    plugins: [nodeResolve],
  });

  const {
    output: [{ code }]
  } = await bundle.generate({
    // 决定生成的code如何exports，该配置项默认值为default，详见官网
    exports: 'named',
    format: 'cjs'
  })
  return code;
};

// export interface UserConfig extends Partial<BuildConfig>, ServerConfig {
//   plugins?: Plugin[]
// }

export default {
  build,
};
