const socket = io();

function sendMessageWithResult(result) {
  const message = result; // 使用识别结果作为消息
  document.getElementById('message').value = message;
  sendMessage();
}

window.dom = new Vue({
  el: '#app',
  data: {
    poems: poemsData, 
    activeIndex: '1',
    isRecording: false,
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log('Selected:', key, keyPath);  
    },
    startRecording() {
      console.log(this.poems[0].author);
      console.log('Start recording clicked');  
      this.isRecording = true;
      socket.emit('startRecording');
    },
    sendMessage() {
      const message = document.getElementById('message').value;
      socket.emit('send_message', { message: message });
    },
    updateRecordingStatus(status){
      this.isRecording = status;
    }
  }
});

socket.on('audio_recognized', (data) => {
  console.log('audio_recognized', data);  
  const result = data.result;
  sendMessageWithResult(result);
});

socket.on('recordingFinished', () => {
  console.log('Recording finished');
  dom.updateRecordingStatus(false);  // 使用 Vue 实例的方法更新状态
});