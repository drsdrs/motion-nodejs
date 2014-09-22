express = require('express')
fs = require("fs")
app = express()
# compression = require('compression')
serveStatic = require('serve-static')

c= console;c.l= c.log


app.get '/images', (req, res)->
  fs.readdir "/home/images", (err, files)->
    if err then return throw err
    c.l "images :"+files.length
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end JSON.stringify(files)

# app.use compression()
app.use '/', express.static __dirname + '/app'
app.use serveStatic '/home/images', { 'maxAge': 68000000, 'index':false, 'dotfiles':'ignore'  }


app.listen 9000
