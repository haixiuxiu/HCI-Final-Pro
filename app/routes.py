from flask import Blueprint, render_template,Flask, request, send_from_directory, current_app,jsonify
from flask_socketio import emit
import dashscope
from . import socketio
from .myaudio import *
from .recite import *
from .gridGame import *
import json
from .feihualing import *
import random
import base64
from .word2picture import generate_image
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

@socketio.on('structure_message')
def handle_message(data):
    session_id = data.get('session_id')
    user_message = data.get('message')

    # 检查 session_id 是否已经存在
    if session_id not in dialogues:
        dialogues[session_id] = []  # 初始化对话历史
        first_response = True  # 标记为第一次回复
    else:
        first_response = False  # 不是第一次回复

    # 更新对话上下文
    dialogues[session_id].append({"role": "user", "content": user_message})

    # 准备对话内容作为模型输入
    context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in dialogues[session_id]])
    prompt = f"{context}\nAssistant:"

    # 如果是第一次回复，添加固定格式的提示
    if first_response:
        fixed_format_prompt = (
        "根据用户请求的关键字，按照以下固定格式生成古诗词的介绍：\n"
        "标题：《{title}》 作者：{author} 朝代：{dynasty}\n"  # 标题、作者、朝代在同一行
        "创作背景：{background} 诗词正文：\n{content}\n"  # 创作背景和诗词正文在同一行
        "注释：{annotations} 赏析：\n{appreciation}\n"  # 注释和赏析在同一行
        "影响与评价：{evaluation} 相关作品：\n{related_works}\n"  # 影响与评价和相关作品在同一行
        "请生成回复。"
    )
        # 将固定格式的提示添加到prompt中
        prompt += fixed_format_prompt.format(
            title="",
            author="",
            dynasty="",
            background="",
            content="",
            annotations="",
            appreciation="",
            evaluation="",
            related_works=""
        )

    # 调用 AI 模型生成回复
    response_generator = dashscope.Generation.call(
        model='qwen-turbo',
        prompt=prompt,
        stream=True,
        top_p=0.8
    )
    previous_length = 0
    paragraph = ""
    for resp in response_generator:
        paragraph = resp.output['text']
        chunk = paragraph[previous_length:]
        previous_length = len(paragraph)
        emit('receive_chunk', {'chunk': chunk})
        socketio.sleep(0.1)  # 让控制权，以便缓冲区刷新和客户端处理

    # 将 AI 的回复添加到对话上下文中
    dialogues[session_id].append({"role": "assistant", "content": paragraph})

    # 发送完成信号
    emit('complete')
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

@socketio.on('startRecordingFly')
def handle_record_audio():
    print("Recording started")
    filename = 'audio.wav'
    record_audio(filename, duration=6)
    # 录音结束后立即进行语音识别
    # recognize_result = recognize_audio(filename)
    recognize_result = recognize_audio('audio4.wav')#测试用：寄蜉蝣于天地，渺沧海之一粟
    #recognize_result = recognize_audio('audio2.wav')#粤语测试用：寄蜉蝣于天地，渺沧海之一粟
    # 向客户端发送录音完成事件
    emit('audio_recognizedFly', {'result': recognize_result})
    print(recognize_result)


@socketio.on('beginRecite')
def check(answer):
    print('beginRecite')
    reward = check_recitation(answer)
    emit('recite_end',reward)

@socketio.on('beginSpeak')
def check(answer):
    print(answer[3:])
    reward = playLogic(answer[3:])
    emit('speak_end',reward)

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
    return render_template('飞花令.html')
@main.route('/start', methods=['GET'])
def start_game():
    global current_keyword
    current_keyword = random.choice(keywords)
    return jsonify({'keyword': current_keyword})

@main.route('/submit', methods=['POST'])
def submit_response():
    global current_keyword
    data = request.get_json()
    user_response = data['user_response']
    keyword = data['keyword']

    ai_response = get_ai_response(keyword,user_response)
    user_result = judge_response(user_response, keyword)
    ai_result = judge_response(ai_response, keyword)

    judge_result = '用户正确!' if user_result else '用户错误!'
    if ai_response:
        judge_result += ' AI选手: ' + ('正确!' if ai_result else '错误!')
    else:
        judge_result += ' AI选手: 无法回答!'

    return jsonify({'judge_result': judge_result, 'ai_response': ai_response})

@main.route('/generate', methods=['POST'])
def generate():
    description = request.form['description']
    image_name, error = generate_image(description)
    if error:
        return f"Error: {error}", 500
    with open(f'app/static/generated_images/{image_name}', 'rb') as img_file:
        img_base64 = base64.b64encode(img_file.read()).decode('utf-8')
    return jsonify(image_base64=img_base64)

@main.route('/static/generated_images/<filename>')
def send_image(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)