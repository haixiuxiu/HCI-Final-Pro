import pyaudio
import wave
from aip import AipSpeech

APP_ID = '74687862'
API_KEY = 'CkO7MUoMYwYeVTsog7AZYcU1'
SECRET_KEY = '1kwn4xvvCbUUzPRwHYwPgSkCurLVeRk2'

recording = False

# 录音
def record_audio(filename, duration=5):
    #recording = True
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
        if recording:
            data = stream.read(CHUNK)
            frames.append(data)
        else:
            break

    stream.stop_stream()
    stream.close()
    audio.terminate()
    wf = wave.open(filename, 'wb')
    wf.setnchannels(CHANNELS)
    wf.setsampwidth(audio.get_sample_size(FORMAT))
    wf.setframerate(RATE)
    wf.writeframes(b''.join(frames))
    wf.close()
# 识别
def recognize_audio(audio_file):
    # 使用百度语音识别大模型进行语音识别
    client = AipSpeech(APP_ID, API_KEY, SECRET_KEY)

    # 读取音频文件
    with open(audio_file, 'rb') as f:
        audio_data = f.read()

    # 进行语音识别
    result = client.asr(audio_data, 'wav', 16000, {
        'dev_pid': 1537, 
    })


    if 'result' in result:
        # 提取识别结果
        return result['result'][0]
    else:
        # 识别失败
        return "识别失败"