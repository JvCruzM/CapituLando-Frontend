const net = require("node:net");
const http = require("node:http");
const messages = [];
net
  .createServer((socket) => {
    socket.setEncoding("utf8");
    socket.write("220 localhost test SMTP\r\n");
    let buffer = "",
      data = false,
      message = [];
    socket.on("data", (chunk) => {
      buffer += chunk;
      let end;
      while ((end = buffer.indexOf("\r\n")) >= 0) {
        const line = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        if (data) {
          if (line === ".") {
            messages.push(message.join("\n"));
            message = [];
            data = false;
            socket.write("250 OK\r\n");
          } else message.push(line);
        } else if (/^EHLO|^HELO/.test(line))
          socket.write("250-localhost\r\n250 OK\r\n");
        else if (/^DATA/.test(line)) {
          data = true;
          socket.write("354 End with dot\r\n");
        } else if (/^QUIT/.test(line)) {
          socket.end("221 Bye\r\n");
        } else socket.write("250 OK\r\n");
      }
    });
  })
  .listen(2525, "127.0.0.1");
http
  .createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(messages));
  })
  .listen(1025, "127.0.0.1");
