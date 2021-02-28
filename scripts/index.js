var shell = require('shelljs');

shell.rm('-rf', 'node_modules/vite');
shell.cp('-R', 'dist/', 'node_modules/vite');
