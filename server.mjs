import { readdir, readFile } from 'fs/promises';
import { createServer } from 'net';

const srv = createServer();
const port = 3000;
const dir = 'static/';
const help = './help';

srv.on('error', (err) => console.error(err));
srv.on('connection', async (client) => {
  client.setEncoding('utf-8');
  const cat = async (pt, cl = client) => {
    let filecont;
    try {
      filecont = await readFile(pt, 'utf-8');
    } catch (err) {
      console.error(err.message);
      filecont = err.message;
    } finally {
      cl.write(JSON.stringify(`\n${filecont}`));
    }
  };
  console.log('Client connected');
  client.on('error', (error) => console.error(error));
  client.on('end', () => console.log('Client disconnected'));
  client.on('data', async (data) => {
    let comm;
    let query;
    let list = [];
    try {
      [comm, query] = JSON.parse(JSON.stringify(data))
        .replace(/\s+/gi, ' ')
        .replace(/\\/gi, '')
        .split(' ');
      list = await readdir(dir, 'utf-8');
    } catch (err) {
      console.error(err.message);
      client.write(err.message);
    }
    const path = list.find((route) => route.includes(query));
    if (comm === 'l' || comm === 'ls' || comm === 'list') {
      client.write(JSON.stringify(list));
    } else if (comm === 'c' || comm === 'cat') {
      cat(dir + path);
    } else if (comm === 'h' || comm === 'help') {
      cat(help);
    } else client.write(JSON.stringify(`I don't understand '${data}', try 'help'`));
  });
});

srv.listen(port, () => {
  console.log('Server running on port', port);
});
