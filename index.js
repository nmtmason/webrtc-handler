var EventEmitter = require('events').EventEmitter
var uuid = require('uuid').v4
var smerge = require('smerge')

module.exports = function handler(options) {
  function getSocket(id) {
    for (var i = 0; i < sockets.length; i += 1) {
      var socket = sockets[i]
      if (socket.id === id) {
        return socket
      }
    }
  }
  var server = options.server
  var debug = options.debug
  var sockets = []
  var emitter = new EventEmitter
  server.on('connection', function (socket) {
    socket.id = uuid()
    sockets.push(socket)
    socket.on('message', function (data) {
      var message
      try {
        message = JSON.parse(data)
      } catch (err) {
        emitter.emit('error', err)
        return
      }
      if (debug) {
        console.log(message.type)
      }
      emitter.emit(message.type, message, socket)
    })
    socket.on('close', function () {
      if (debug) {
        console.log('leave')
      }
      sockets.splice(sockets.indexOf(socket), 1)
      emitter.emit('leave', socket)
    })
    socket.on('error', function (err) {
      emitter.emit('error', err)
    })
  })

  emitter.on('join', function (message, socket) {
    var peers =
      sockets
        .filter(function (s) { return s.id !== socket.id })
        .map(function (s) { return s.id })

    for (var i = 0; i < sockets.length; i += 1) {
      var peer = sockets[i];
      if (peer.id !== socket.id) {
        peer.send(JSON.stringify({ type: 'join', id: socket.id }))
      }
    }
    socket.send(JSON.stringify({ type: 'peers', id: socket.id, peers: peers }))
  })
  emitter.on('offer', function (message, socket) {
    var peer = getSocket(message.id)
    peer.send(JSON.stringify(smerge(message, { id: socket.id })))
  })
  emitter.on('answer', function (message, socket) {
    var peer = getSocket(message.id)
    peer.send(JSON.stringify(smerge(message, { id: socket.id })))
  })
  emitter.on('candidate', function (message, socket) {
    var peer = getSocket(message.id)
    peer.send(JSON.stringify(smerge(message, { id: socket.id })))
  })
  emitter.on('leave', function (socket) {
    for (var i = 0; i < sockets.length; i += 1) {
      var peer = sockets[i]
      if (peer.id !== socket.id) {
        peer.send(JSON.stringify({ type: 'leave', id: socket.id }))
      }
    }
  })

  return emitter
}

