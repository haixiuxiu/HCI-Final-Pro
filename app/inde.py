from aip import AipSpeech

# 请替换为您自己的应用ID、API Key和Secret Key
APP_ID = '74687862'
API_KEY = 'CkO7MUoMYwYeVTsog7AZYcU1'
SECRET_KEY = '1kwn4xvvCbUUzPRwHYwPgSkCurLVeRk2'

def recognize_audio(audio_file):
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

if __name__ == "__main__":
    audio_file = "audio.wav"
    result = recognize_audio(audio_file)
    print("识别结果:", result)
