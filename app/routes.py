from flask import Blueprint, render_template
from flask_socketio import emit
import dashscope
from . import socketio
from .myaudio import *
from .recite import *
from .gridGame import *
import json

APP_ID = '74687862'
API_KEY = 'CkO7MUoMYwYeVTsog7AZYcU1'
SECRET_KEY = '1kwn4xvvCbUUzPRwHYwPgSkCurLVeRk2'

main = Blueprint('main', __name__)

dashscope.api_key = "sk-ea631a8d7dea448d850f19da3690abb3"
# 存储对话上下文
dialogues = {}
@main.route('/')
def index():
    poems_for_show = load_poems('poems.txt')
    nineGridOfAll = load_exam('NineGongGridGame.txt')
    # 直接将整个列表进行序列化
    questionOfGridData = json.dumps(nineGridOfAll, cls=QuestionOfNineGridEncoder)
    print('12345789')
    return render_template('main.html', poemData=json.dumps(poems_for_show), questionsOfGridData=questionOfGridData)

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

@socketio.on('startRecording')
def handle_record_audio():
    print("Recording started")
    filename = 'audio.wav'
    record_audio(filename, duration=15)
    # 录音结束后立即进行语音识别
    # recognize_result = recognize_audio(filename)
    recognize_result = recognize_audio('audio4.wav')#测试用：寄蜉蝣于天地，渺沧海之一粟
    #recognize_result = recognize_audio('audio2.wav')#粤语测试用：寄蜉蝣于天地，渺沧海之一粟
    # 向客户端发送录音完成事件
    emit('audio_recognized', {'result': recognize_result})
    print(recognize_result)

@socketio.on('beginRecite')
def check(answer):
    print('beginRecite')
    check_recitation(answer)

@main.route('/page1')
def page1():
    return render_template('learn.html')

@main.route('/page2')
def page2():
    poems_for_show = load_poems('poems.txt')
    return render_template('recitation.html',poemData=json.dumps(poems_for_show))

@main.route('/page3')
def page3():
    nineGridOfAll = load_exam('NineGongGridGame.txt')
    # 直接将整个列表进行序列化
    questionOfGridData = json.dumps(nineGridOfAll, cls=QuestionOfNineGridEncoder)
    return render_template('adventure.html', questionsOfGridData=questionOfGridData)

@main.route('/page4')
def page4():
    return render_template('learn.html')