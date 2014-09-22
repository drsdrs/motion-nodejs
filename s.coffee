express = require('express')
fs = require("fs")
app = express()
# compression = require('compression')
serveStatic = require('serve-static')

c= console;c.l= c.log

# app.use compression()
app.use '/', express.static __dirname + '/app'
app.use serveStatic '/home/images', { 'maxAge': 68000000, 'index':false, 'dotfiles':'ignore'  }


app.get '/images', (req, res)->
  fs.readdir "/home/images", (err, files)->
    if err then return throw err
    c.l "images :"+files.length
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end JSON.stringify(files)


app.get '/download', (req, res)->
  spawn = require("child_process").spawn
  zip = spawn("zip", ["-r", "-", ".", "*"], cwd: "/home/images")
  res.contentType "application/zip"
  zip.stdout.on "data", (data) -> res.write data
  zip.stderr.on 'data', (data) -> console.log 'zip stderr: '+data
  zip.on "exit", (code) ->
    if code isnt 0
      res.statusCode = 500
      console.log "zip process exited with code " + code
      res.end()
    else
      console.log "zip done"
      res.end()

app.get '/rm', (req, res)->
  spawn = require("child_process").spawn
  rm = spawn("rm", ["/home/images/", "-r"])
  rm.stderr.on 'data', (data) -> console.log 'rm stderr: '+data
  rm.on "exit", (code) ->
    mkdir = spawn("mkdir", ["/home/images/"])

    if code isnt 0
      res.statusCode = 500
      console.log "rm exited with code " + code
      res.end()
    else
      console.log "rm done"
      res.end()





app.listen 9000
