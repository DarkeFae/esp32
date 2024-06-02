const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      fs.appendFile('message.txt', ',\n', (err) => {
        if (err) throw err;
        console.log('The "data to append" was appended to file!');
      });
      fs.appendFile('message.txt', body, (err) => {
        if (err) throw err;
        console.log('The "data to append" was appended to file!');
      });
    console.log(body);
    });
  }
  res.end("Hello World");
});



server.listen(3000, () => {
  console.log("Server is running on port 3000");
});