declare const __HMR_PORT__: string;

window.process = window.process || {};
window.process.env = window.process.env || {};
window.process.env.NODE_ENV = "development";

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

export function updateStyle(id: string, content: string) {

}
