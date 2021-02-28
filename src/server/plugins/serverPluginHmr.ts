import WebSocket from 'ws';
import { ICorePlugin } from '../';

type updateType = 'full-reload' | 'js-update';
export interface IMessage {
  type: updateType;
  path: string;
  changeSrcPath: string;
  timestamp: number;
}

const hmrAcceptanceMap = new Map();

const plugin: ICorePlugin = ({ app, server, utils }) => {
  const wss = new WebSocket.Server({
    noServer: true,
  });
  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
    });
  });
  wss.on('connection', function connection(ws) {
    ws.send(JSON.stringify('test'));
  });
  app.use(async (ctx, next) => {
    await next();
  });
  utils.send = (msg: IMessage) => {
    wss.clients.forEach(client => {
      client.send(JSON.stringify(msg));
    })
  };
};
// 用于判断 importer的accept列表里是否包含该依赖
function isHmrAccepted(importer: string, dep: string): boolean {
  const deps = hmrAcceptanceMap.get(importer)
  return deps ? deps.has(dep) : false
}

export default plugin;
