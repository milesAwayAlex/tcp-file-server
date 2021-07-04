import { createConnection } from 'net';
import { createInterface } from 'readline';

const port = 3000;
const host = 'localhost';
const conn = createConnection({ host, port });
const read = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: ' > ',
});
const path = process.argv[2];

conn.setEncoding('utf-8');
conn.on('error', (err) => console.error(err));
conn.on('connect', () => {
  if (path) {
    conn.write(`c ${path}`);
  }
  conn.on('end', () => console.log('Disconnected from', host, '- client has to be restarted'));
  conn.on('data', (data) => {
    try {
      const dataObj = JSON.parse(data);
      if (Array.isArray(dataObj)) {
        dataObj.forEach((name) => console.log(name));
      } else {
        console.log(dataObj);
      }
    } catch (err) {
      console.log(err.message);
    }
    if (path) {
      process.exit(0);
    }
    read.prompt();
  });
  console.log(`Connected to ${host} on port`, port);
  read
    .on('line', (command) => {
      conn.write(command);
    })
    .on('close', () => {
      console.log('shutting down the client..\n');
      process.exit(0);
    });
  read.prompt();
});
