import * as express from 'express';

export default (base: string, title: string) => (
  req: express.Request,
  res: express.Response
): void => {
  const resourcePath = /^\/ssh\//.test(req.url.replace(base, '/'))
    ? '../'
    : base;

  res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>${title}</title>
    <link rel="stylesheet" href="${resourcePath}public/index.css" />
  </head>
  <body>
    <div id="overlay">
      <div class="error">
        <div id="msg"></div>
        <input type="button" onclick="location.reload();" value="reconnect" />
      </div>
    </div>
    <div id="options">
      <a class="toggler"
         href="#"
         alt="Toggle options"><i class="fas fa-cogs"></i></a>
      <textarea class="editor"></textarea>
    </div>
    <div id="terminal"></div>
    <script src="${resourcePath}public/index.js"></script>
  </body>
</html>`);
};
