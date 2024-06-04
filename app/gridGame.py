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
    def __init__(self,title,hint,answer):
        self.title = title
        self.hint = hint
        self.answer = answer
    def to_dict(self):
        return {
            "title": self.title,
            "hint": self.hint,
            "answer": self.answer
        }

def load_exam(file_path):
    questions = []
    with open(file_path,'r', encoding='utf-8') as file:
        lines = file.readlines()
        topic = []
        hint = []
        for i in range(0,len(lines)):
            if '#' in lines[i]:
                topic = []
                hint = []
                answer = ''
                i=i+2
                for j in range(3):
                    word = lines[i+j].split()
                    topic.append(word)
                i = i+j+1
                for j in range(2):
                    hint.append(lines[i+j])
                i=i+j+1
                answer = lines[++i]
                question = questionOfNineGrid(topic,hint,answer)
                questions.append(question)
    return questions

#可以只传answer
def playLogic(numOfQuestion,questions):
    print("请在10s内作答，如作答完毕，点击结束录音")
    filename = "question.wav"
    record_audio(filename,10)
    result = recognize_audio(filename)

    if result != '识别失败':
        print("识别结果：",result)

        #文本匹配
        distance = Levenshtein.distance(result,questions[numOfQuestion].answer[3:0])
        #结果反馈
        if distance<10:
            print("背诵正确，诗词为：",questions[numOfQuestion].answer[3:0])
        else:
            print("背诵错误，正确答案为：",questions[numOfQuestion].answer[3:0],", 匹配距离:", distance)
    else:
        print("出错")  