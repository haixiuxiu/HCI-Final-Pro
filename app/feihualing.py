import dashscope
import random

class HostAgent:
    def __init__(self, keywords):
        self.keywords = keywords
        self.current_keyword = None
        self.first_round = True
        self.index = 0

    def give_keyword(self):
        if self.first_round:
            if self.index < len(self.keywords):
                self.current_keyword = self.keywords[self.index]
                self.index += 1
            if self.index >= len(self.keywords):
                self.first_round = False
        else:
            self.current_keyword = random.choice(self.keywords)
        return self.current_keyword

class JudgeAgent:
    def __init__(self):
        pass

    def judge(self, sentence, keyword):
        return keyword in sentence

# 示例关键字和诗句
keywords = ['月','花', '山', '水', '树', '风', '雨', '云', '天', '雾', '露', '霜', '雪', '声', '草', '木', '石', '鸟', '虫']
poems = [
    '床前明月光，疑是地上霜',
    '举头望明月，低头思故乡',
    '春江潮水连海平，海上明月共潮生',
    '明月几时有，把酒问青天'
]

current_keyword = ''
dashscope.api_key = "sk-ea631a8d7dea448d850f19da3690abb3"
# 存储对话上下文
dialogues = []

def get_ai_response(keyword, user_response):

    # 更新对话上下文，记录用户的输入
    dialogues.append({"role": "user", "content": user_response})
    
    # 准备对话内容作为模型输入
    context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in dialogues])
    prompt = f"{context}\nAssistant: 回复一句包含关键字'{keyword}'的诗句，且不能与之前的回复或用户输入重复,而且必须是正确的古诗，不能是编纂出来的诗句。"

    # 初始化一个变量来存储AI的回复
    assistant_reply = ""
    # 循环直到我们得到一个不重复的回复
    while True:
        # 调用通义千问大模型生成回复
        response_generator = dashscope.Generation.call(
            model='qwen-plus',
            prompt=prompt,
            stream=True,
            top_p=0.8
        )
        
        for resp in response_generator:
            assistant_reply = resp.output['text']
        
        # 检查回复是否包含关键字，并且与AI和用户的之前回复都不重复
        if keyword in assistant_reply and all(assistant_reply != msg['content'] for msg in dialogues):
            break
        else:
            # 如果回复不满足条件，更新提示信息并继续循环
            prompt = f"{context}\nAssistant: 请再次尝试，确保回复包含关键字'{keyword}'且不与之前的回复或用户输入重复。"
            assistant_reply = ""  # 重置回复变量

    # 将 AI 的回复添加到对话上下文中
    dialogues.append({"role": "assistant", "content": assistant_reply})
    
    # 返回 AI 生成的回复
    return assistant_reply

def judge_response(response, keyword):
    # 模拟裁判的判断逻辑
    return keyword in response