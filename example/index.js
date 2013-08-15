var http = require('http')
var ecstatic = require('ecstatic')
var WebSocketServer = require('ws').Server
var webrtc = require('webrtc-handler')

var server = http.createServer(ecstatic({ root: __dirname + '/static' }))
var wss = new WebSocketServer({ server: server })
var handler = webrtc({ server: wss, debug: true })

server.listen(process.env.PORT || Number(8e3))

