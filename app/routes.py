from flask import Blueprint, render_template
from flask_socketio import emit
import dashscope
import pyaudio
import wave
from . import socketio
from aip import AipSpeech

APP_ID = '74687862'
API_KEY = 'CkO7MUoMYwYeVTsog7AZYcU1'
SECRET_KEY = '1kwn4xvvCbUUzPRwHYwPgSkCurLVeRk2'

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

@socketio.on('startRecording')
def handle_record_audio():
    print("Recording started")
    filename = 'audio.wav'
    record_audio(filename, duration=5)
    # 录音结束后立即进行语音识别
    print("indi finish")
    recognize_result = recognize_audio(filename)
    print("indi finish")
    emit('audio_recognized', {'result': recognize_result})
    print(recognize_result)

def record_audio(filename, duration=5):
    CHUNK = 1024
    FORMAT = pyaudio.paInt16
    CHANNELS = 1
    RATE = 16000

    audio = pyaudio.PyAudio()

    stream = audio.open(format=FORMAT, channels=CHANNELS,
                        rate=RATE, input=True,
                        frames_per_buffer=CHUNK)

    print("Recording...")

    frames = []

    for i in range(0, int(RATE / CHUNK * duration)):
        data = stream.read(CHUNK)
        frames.append(data)

    stream.stop_stream()
    stream.close()
    audio.terminate()
    wf = wave.open(filename, 'wb')
    wf.setnchannels(CHANNELS)
    wf.setsampwidth(audio.get_sample_size(FORMAT))
    wf.setframerate(RATE)
    wf.writeframes(b''.join(frames))
    wf.close()

def recognize_audio(audio_file):
    print(1)
    """ 使用百度语音识别大模型进行语音识别 """
    client = AipSpeech(APP_ID, API_KEY, SECRET_KEY)

    # 读取音频文件
    with open(audio_file, 'rb') as f:
        audio_data = f.read()

    # 进行语音识别
    result = client.asr(audio_data, 'wav', 16000, {
        'dev_pid': 1537,  # 普通话(支持简单的英文识别)模型
    })

    if 'result' in result:
        # 提取识别结果
        return result['result'][0]
    else:
        # 识别失败
        return "识别失败"