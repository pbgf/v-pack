import path from 'path';

//非 . / 开头的模块 都是bareModule
export const bareImportRE =  /^[^\/\.]/;

// 请求路径 映射成 文件系统的路径
export function requestToFile(root: string, reqPath: string): string{
  return path.resolve(root, `.${reqPath}`);
};
// importer: 发出import者， importee: 被import者
export function resolveRelativeRequest(importer: string, importee: string) {
  return path.resolve(importer, importee);
};
