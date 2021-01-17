import path from 'path';

export default {
  mode: 'dev',
  optimizeDeps: {},
  alias: {
    // 内置@指向src
    dist: path.resolve(__dirname, './dist'),
  },
}
