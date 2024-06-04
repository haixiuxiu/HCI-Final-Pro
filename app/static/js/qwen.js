document.addEventListener('DOMContentLoaded', (event) => {
    const socket = io();
    const sessionId = generateSessionId();
    let collectedChunks = '';

    socket.on('receive_chunk', (data) => {
        console.log("Received chunk: ", data.chunk);  // Debug output
        const replyElement = document.getElementById('reply');
        replyElement.innerText += data.chunk;
    });

    socket.on('complete', () => {
        // Optional: Handle any completion logic if needed
    });

    window.sendMessage = function() {
        const message = document.getElementById('message').value;
        document.getElementById('reply').innerText = '';  // Clear previous reply
        collectedChunks = '';  // Clear previous chunks
        socket.emit('send_message', { message: message, session_id: sessionId });
    };

    function generateSessionId() {
        return 'session-' + Math.random().toString(36).substr(2, 16);
    }
});
