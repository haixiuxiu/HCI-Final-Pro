from flask import Blueprint, render_template
from flask_socketio import emit
import dashscope
from . import socketio

main = Blueprint('main', __name__)

dashscope.api_key = "sk-ea631a8d7dea448d850f19da3690abb3"

@main.route('/')
def index():
    return render_template('main.html')

@socketio.on('send_message')
def handle_message(data):
    prompt_text = data['message']

    # 确保提示内容中明确指定使用中文
    response_generator = dashscope.Generation.call(
        model='qwen-turbo',
        prompt=f"{prompt_text}（请用中文回答）",
        stream=True,
        top_p=0.8
    )

    previous_length = 0
    for resp in response_generator:
        paragraph = resp.output['text']
        chunk = paragraph[previous_length:]
        previous_length = len(paragraph)
        print(f"Sending chunk: {chunk}")  # Debug output
        emit('receive_chunk', {'chunk': chunk})
        socketio.sleep(0.1)  # Yield control to allow the buffer to flush and client to process

    emit('complete')  # Send completion signal
