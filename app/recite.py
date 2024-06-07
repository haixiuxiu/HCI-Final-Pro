from .myaudio import *
import Levenshtein
import re

def remove_punctuation(text):
    # 只保留汉字、字母和数字字符
    return re.sub(r'[^\w\s\u4e00-\u9fff]', '', text)

# 设置参数
FORMAT = 'pcm'  # 语音格式，这里假设是PCM格式
RATE = 16000  # 采样率，这里假设是16k
DEV_PID = 1737  # 语言模型，1737表示诗词背诵模型

# 从文本文件中读取诗词库
def load_poems(file_path):
    poems_for_show = []
    with open(file_path, 'r', encoding='utf-8') as file:
        title, author, content = None, None, []
        for line in file:
            line_txt = line.strip()
            if '#' in line_txt:
                if title and author and content:
                    poems_for_show.append({'title': title, 'author': author, 'content': ''.join(content)})
                title = next(file).strip() # 获取标题，假设标题在 # 之后
                author = next(file).strip()  # 获取下一行作为作者
                content = []
            else:
                content.append(line_txt)
        if title and author and content:  # 添加最后一首诗
            poems_for_show.append({'title': title, 'author': author, 'content': ''.join(content)})
    return poems_for_show

# 进行语音识别和背诵检查
def check_recitation(answer):
    # 进行语音识别
<<<<<<< HEAD
    record_audio('recite.wav',20)
    result = recognize_audio('recite.wav')

=======
    record_audio('recite.wav',15)
    result = recognize_audio('recite.wav')
    answer = remove_punctuation(answer)
    print(answer)
>>>>>>> 185086832b546c40c28ad7cef1cabef4b9d52984
    if result!='识别失败':
        print("识别结果:", result)
        result = remove_punctuation(result)
        # 文本匹配
        distance = Levenshtein.distance(result, answer)
        #answer = "江南《汉乐府》江南可采莲，莲叶何田田。鱼戏莲叶间。"
        #distance = Levenshtein.distance(result, answer)

        # 结果反馈
        if distance < 5:  # 设定一个阈值，表示匹配度的容忍程度
            print("背诵正确")
            return 3
        elif distance < 7:
            print("有一点小错误")
            return 2
        elif distance < 10:
            print("错误较多")
            return 1
        else:
            print("背诵错误，正确的诗词为:", answer, ", 匹配距离:", distance)
            print("正确的诗词文本为:",answer)
            return 0
    else:
        print("出错")