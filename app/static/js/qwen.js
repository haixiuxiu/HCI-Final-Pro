

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
        console.log('Sending message!!!:', message);  // Ensure this line executes

        document.getElementById('reply').innerText = '';  // Clear previous reply
        collectedChunks = '';  // Clear previous chunks

        // Emit the message to the server
        socket.emit('structure_message', { message: message, session_id: sessionId });
        socket.emit('generate', { description: message });
        console.log('Sent message to server');
        // Send AJAX request to generate the image
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/generate', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.image_base64) {
                    document.getElementById('generatedImage').src = 'data:image/jpeg;base64,' + response.image_base64;
                    document.getElementById('imageContainer').style.display = 'block';
                }
            }
        };
        xhr.send(`description=${encodeURIComponent(message)}`);
    };

    function generateSessionId() {
        return 'session-' + Math.random().toString(36).substr(2, 16);
    }
});
