from .myaudio import *
import Levenshtein
import json

# 设置参数
FORMAT = 'pcm'  # 语音格式，这里假设是PCM格式
RATE = 16000  # 采样率，这里假设是16k
DEV_PID = 1737  # 语言模型，1737表示诗词背诵模型

class QuestionOfNineGridEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, questionOfNineGrid):
            return obj.to_dict()
        return super(QuestionOfNineGridEncoder, self).default(obj)

class questionOfNineGrid:
    def __init__(self,title,answer):
        self.title = title
        self.answer = answer
    def to_dict(self):
        return {
            "title": self.title,
            "answer": self.answer
        }

def load_exam(file_path):
    questions = []
    with open(file_path,'r', encoding='utf-8') as file:
        lines = file.readlines()
        topic = []
        for i in range(0,len(lines)):
            if '#' in lines[i]:
                topic = []
                answer = ''
                i=i+2
                for j in range(3):
                    word = lines[i+j].split()
                    topic.append(word)
                i=i+j+1
                answer = lines[++i]
                question = questionOfNineGrid(topic,answer)
                questions.append(question)
    return questions

#可以只传answer
def playLogic(answer):
    print("请在10s内作答，如作答完毕，点击结束录音")
    record_audio('speak.wav',10)
    result = recognize_audio('speak.wav')

    if result != '识别失败':
        print("识别结果：",result)

        #文本匹配
        distance = Levenshtein.distance(result,answer)
        #结果反馈
        if distance<=2:
            return 1
        else:
            return 0
    else:
        print("出错")  

#questions = load_exam("NineGongGridGame.txt")
#playLogic(1,questions)