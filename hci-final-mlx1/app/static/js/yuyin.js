const socket = io();

function sendMessageWithResult(result) {
  const message = result; // 使用识别结果作为消息
  document.getElementById('message').value = message;
  sendMessage();
}

new Vue({
  el: '#app',
  data() {
    return {
      activeIndex: '1',
      isRecording: false
    };
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log('Selected:', key, keyPath);  // Debug output
    },
    startRecording() {
      console.log('Start recording clicked');  // Debug output
      this.isRecording = true;
      socket.emit('startRecording');
    },
    sendMessage() {
      const message = document.getElementById('message').value;
      document.getElementById('reply').innerText = '';  // Clear previous reply
      socket.emit('send_message', { message: message });
    }
  }
});

socket.on('audio_recognized', (data) => {
  console.log('audio_recognized', data);  // Debug output
  const result = data.result;
  sendMessageWithResult(result);
});
