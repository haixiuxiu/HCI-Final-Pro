document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('nav-xuexi').classList.add('selected');
})

const socket = io();
var recordButton = document.getElementById('recordButton')
canPush = true

function sendMessageWithResult(result) {
  const message = result; // 使用识别结果作为消息
  document.getElementById('message').value = message;
}

function startRecording() {
  console.log('Start recording clicked');
  canPush = false;
  socket.emit('startRecording');
}

socket.on('audio_recognized', (data) => {
  //console.log('audio_recognized', data);
  console.log('audio_recognized');
  const result = data.result;
  sendMessageWithResult(result);
  canPush = true
})


