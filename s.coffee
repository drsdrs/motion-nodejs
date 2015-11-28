c= console;c.l= c.log
express = require('express')
fs = require("fs")
serveStatic = require('serve-static')
bodyParser = require("body-parser")
querystring = require('querystring')
request = require('request')
exec = require('child_process').exec
spawn = require('child_process').spawn

app = express()
body_parser = bodyParser.urlencoded({ extended: false })
imagePath = __dirname+"/images/"
moviePath = __dirname+"/movies/"
staticRootDir = express.static __dirname + '/app'
imageList = []


app.use '/', staticRootDir

app.use serveStatic imagePath, { 'maxAge': 68000000, 'index':false, 'dotfiles':'ignore' }
app.use serveStatic moviePath, { 'maxAge': 68000000, 'index':false, 'dotfiles':'ignore' }

motion =
  running: false
  process: null
  start: (cb)->
    console.log "Start motion"
    motion.process = spawn "motion", ["-c", "motion.conf"]
    motion.process.stderr.once 'data', -> cb()
    motion.running = true
  stop: (cb)->
    console.log "Kill all motion"
    exec "killall motion", cb
    motion.running = false
    motion.process = null
  config:
    set: (k,v, cb)-> post("http://127.0.0.1:3900/0/config/set?"+k+"="+v, cb)
    get: (k, cb)-> post("http://127.0.0.1:3900/0/config/get?query="+k, cb)
    write: (cb)->
      c.l "CONFIG WRITEN"
      post "http://127.0.0.1:3900/0/config/write", ->
        post "http://127.0.0.1:3900/0/config/writeyes", ->
          post "http://127.0.0.1:3900/0/action/restart", cb() if cb?

convertImg2Mov = (data, cb)->
  captureRunning = false
  if data.start? && data.end?
    imagesToAnimate = imageList.slice data.start, data.end
    imagesString = imagesToAnimate.join " "
    command = 'cat '+imagesString+'| avconv -f image2pipe -r '+data.fps+' -i - -codec:v libx264 -b:v 256k -an movies/'+data.name+'.mp4'
  else
    command = 'cat images/*.jpg | avconv -f image2pipe -r '+data.fps+' -i - -codec:v libx264 -b:v 256k -an movies/'+data.name+'.mp4'
  exec command, (error, stdout, stderr)->
    if error? then console.log('convertImg2Mov error: '+error)
    else cb() if cb?

post = (url, cb)->
  request.get { url:url }, (err, httpResponse, body)->
    if err then console.log "postEr:"+"url:",url
    else
      if cb? then cb err, body

getImages = (files)->
  addPrefix = (files)->
    files.forEach (v,i)->
      files[i] = imagePath+v
    imageList = files
  if files? then addPrefix files
  else
    fs.readdir imagePath, (err, files)->addPrefix files

getImages()

app.post '/makeMovieAll', body_parser, (req, res)->
  exec("rm -f movies/*")
  movieParams =
    fps:parseFloat(req.body.fps)
    name:"movie"
  convertImg2Mov movieParams, ()->
    res.end "done!!!"

app.post '/makeMovieSel', body_parser, (req, res)->
  c.l "MAKEmOVIE SEL", req.body
  exec("rm -f movies/*")
  movieParams =
    fps:parseFloat(req.body.fps)
    name:"movie"
    start: parseInt(req.body.start)
    end: parseInt(req.body.end)
  convertImg2Mov movieParams, ()->
    res.end "done!!!"

app.get '/download', (req, res)->
  spawn = require("child_process").spawn
  zip = spawn("zip", ["-r", "-", ".", "*"], cwd: imagePath)
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

app.post '/getImages', body_parser,(req, res)->
  clientImageCount =  req.body.imageLength
  fs.readdir imagePath, (err, files)->
    if err then return throw err
    c.l clientImageCount,files.length
    if clientImageCount!=files.length
      getImages()
      c.l "Get images :"+files.length
      res.writeHead(200, {"Content-Type": "application/json"});
      res.end JSON.stringify(files)
    else
      console.log "get images NONONO!"
      res.end()

app.post '/rmAllImages', (req, res)->
  spawn = require("child_process").spawn
  rm = spawn("rm", [imagePath, "-r"])
  rm.stderr.on 'data', (data) -> console.log 'rm stderr: '+data
  rm.on "exit", (code) ->
    mkdir = spawn("mkdir", [imagePath])
    if code isnt 0
      res.statusCode = 500
      console.log "rm exited with code " + code
      res.end()
    else
      console.log "rm done"
      res.end()

app.post '/rmImages', body_parser, (req, res)-> # get imagelist
  spawn = require("child_process").spawn
  imagesToDel = imageList.slice parseInt(req.body.start), parseInt(req.body.end)
  rm = spawn("rm", imagesToDel)
  rm.stderr.on 'data', (data) -> console.log 'rm stderr: '+data
  rm.stdout.on 'data', (data) -> console.log 'rm stdout: '+data
  rm.on "exit", (code) ->
    res.end("done")



app.post '/getMotionConfig', body_parser,(req, res)->
  motion.config.get req.body.k, (err, result)->
    if err?
      console.log "getMotionConfigError"
      res.end "noConnectionError"
    else res.end String result

app.post '/setMotionConfig', body_parser,(req, res)->
  motion.config.set req.body.k, req.body.v, (err, result)->
    if err? then console.log "SetMotionConfig Error"
    res.end String result

app.post '/writeMotionConfig', (req, res)-> motion.config.write()

app.post '/startStopMotion', (req, res)->
  if motion.running==true
    motion.running = "floating"
    motion.stop (result)->
      motion.running = false
      res.end "stopped"
  else if motion.running==false
    motion.running = "floating"
    motion.start (result)->
      motion.running = true
      res.end "running"
  else
    res.end "progress"

#   INIT
 motion.stop ->
   motion.start ->
      app.listen 9000
      console.log "Server listen on http://localhost:9000"
