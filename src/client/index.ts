declare const __HMR_PORT__: string;

((window as any) as any).process = (window as any).process || {};
(window as any).process.env = (window as any).process.env || {};
(window as any).process.env.NODE_ENV = "development";

const socketProtocol = 'ws', socketHost = `localhost:${__HMR_PORT__}`;

const socket = new WebSocket(`${socketProtocol}://${socketHost}`);

// Connection opened
socket.addEventListener('open', function (event) {
  socket.send('Hello Server!');
});

// Listen for messages
socket.addEventListener('message', function (event) {
  console.log('Message from server ', event.data);
});

const supportsConstructedSheet = (() => {
  try {
    new CSSStyleSheet()
    return true
  } catch (e) {}
  return false
})()

const sheetsMap = new Map()

// https://wicg.github.io/construct-stylesheets
export function updateStyle(id: string, content: string) {
  let style = sheetsMap.get(id)
  // If rules contains one or more @import rules, throw a "NotAllowedError" DOMException.
  // 如果content包含了 @import 调用replaceSync 将会报错
  if (supportsConstructedSheet && !content.includes('@import')) {

    if (!style) {
      style = new CSSStyleSheet()
      style.replaceSync(content)
      // @ts-ignore
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, style]
    } else {
      style.replaceSync(content)
    }
  } else {

    if (!style) {
      style = document.createElement('style')
      style.setAttribute('type', 'text/css')
      style.innerHTML = content
      document.head.appendChild(style)
    } else {
      style.innerHTML = content
    }
  }
  sheetsMap.set(id, style)
}
