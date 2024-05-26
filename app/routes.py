from flask import Blueprint, render_template, request
from flask_socketio import emit
import dashscope
from . import socketio
import uuid

main = Blueprint('main', __name__)

dashscope.api_key = "sk-ea631a8d7dea448d850f19da3690abb3"

# 存储对话上下文
dialogues = {}

@main.route('/')
def index():
    return render_template('main.html')

@socketio.on('send_message')
def handle_message(data):
    session_id = data.get('session_id')
    user_message = data.get('message')
    
    if session_id not in dialogues:
        dialogues[session_id] = []
        print(f"New session: {session_id}")

    # 更新对话上下文
    dialogues[session_id].append({"role": "user", "content": user_message})
    
    # 准备对话内容作为模型输入
    context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in dialogues[session_id]])
    prompt = f"{context}\nassistant:"
    #print(f"Assistant prompt: {prompt}")  # Debug output
    response_generator = dashscope.Generation.call(
        model='qwen-turbo',
        prompt=prompt,
        stream=True,
        top_p=0.8
    )
    previous_length = 0
    paragraph = ""
    #assistant_reply = ""
    for resp in response_generator:
        paragraph = resp.output['text']
        #print(f"Assistant response: {paragraph}")
        #assistant_reply += paragraph
        chunk = paragraph[previous_length:]
        previous_length = len(paragraph)
        #print(f"Sending chunk: {chunk}")  # Debug output
        emit('receive_chunk', {'chunk': chunk})
        socketio.sleep(0.1)  # Yield control to allow the buffer to flush and client to process

    dialogues[session_id].append({"role": "assistant", "content": paragraph })
    #print(dialogues)
    emit('complete')  # Send completion signal
