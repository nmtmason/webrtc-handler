var webrtc = require('webrtc-client')

var getUserMedia = 
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia
getUserMedia = getUserMedia.bind(navigator)

getUserMedia({ video: true, audio: true }, function (stream) {
  var video = document.querySelector('video')
  var url = 'ws://localhost:8000'
  var client = webrtc({ url: url, stream: stream, debug: true })
  client.on('stream add', function (stream, id) {
    video.src = window.URL.createObjectURL(stream);
  })
  client.on('stream remove', function (stream, id) {
    video.src = null
  })
  client.connect()
}, function () { /* noop */ })

