const socket = io();
var recordButton = document.getElementById('recordButton')
recordButton.addEventListener('click', startRecording);

function sendMessageWithResult(result) {
  const message = result; // 使用识别结果作为消息
  document.getElementById('message').value = message;
  sendMessage();
}

function startRecording() {
  console.log('Start recording clicked');
  socket.emit('startRecording');
}

function sendMessage() {
  const message = document.getElementById('message').value;
  socket.emit('send_message', { message: message });
}

function updateRecordingStatus(status){
  isRecording = status;
}

socket.on('audio_recognized', (data) => {
  console.log('audio_recognized', data);
  const result = data.result;
  sendMessageWithResult(result);
})

socket.on('recordingFinished', () => {
  console.log('Recording finished');
  updateRecordingStatus(false);
});
