const socket = io();
var recordButton = document.getElementById('recordButton')
canPush = true

function sendMessageWithResult(result) {
  const message = result; // 使用识别结果作为消息
  document.getElementById('message').value = message;
  sendMessage();
}

function startRecording() {
  console.log('Start recording clicked');
  canPush = false;
  socket.emit('startRecording');
}

function sendMessage() {
  const message = document.getElementById('message').value;
  socket.emit('send_message', { message: message });
}

socket.on('audio_recognized', (data) => {
  //console.log('audio_recognized', data);
  console.log('audio_recognized');
  const result = data.result;
  sendMessageWithResult(result);
  canPush = true
})

