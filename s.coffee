express = require('express')
fs = require("fs")
app = express()
c= console;c.l= c.log


app.get '/images', (req, res)->
  fs.readdir __dirname+"/app/data", (err, files)->
    if err then return throw err
    c.l "images :"+files.length
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end JSON.stringify(files)

app.use express.static __dirname + '/app'


app.listen 9000