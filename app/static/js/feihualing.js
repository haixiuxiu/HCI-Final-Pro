let currentKeyword = '';
let currentLevel = 1;
let correctAnswers = 0;

const levels = [];

function generateLevel(levelNumber) {
    return {
        number: levelNumber,
        target: levelNumber * 2,
        image: 'static/image/background.jpg'
    };
}

function getLevel(levelNumber) {
    while (levels.length < levelNumber) {
        levels.push(generateLevel(levels.length + 1));
    }
    return levels[levelNumber - 1];
}

async function startGame(conf=true) {
    // 首先显示规则介绍
    var start=false
    if(conf)
    {
        showRules();
        // 等待用户阅读规则后，再开始游戏
        start = confirm('请阅读并理解规则后点击确定开始游戏');
    }
    else{
        start = true;
    }
    if (start) {
        const response = await fetch('/start');
        if (response.ok) {
            const data = await response.json();
            currentKeyword = data.keyword;
            document.getElementById('current-keyword').innerText = currentKeyword;
            document.getElementById('judge-result').innerText = '';
            document.getElementById('user-input').value = '';
            const chatContainer = document.getElementById('chat-container');
            chatContainer.innerHTML = ''; // 清空之前的对话

            // 显示输入框和提交按钮
            console.log('显示输入框和提交按钮');
            const inputContainer = document.getElementById('input-container');
            const resultContainer = document.getElementById('result');
            const keywordContainer = document.getElementById('keyword');
            const fly_start_recording=document.getElementById('fly-start-recording');

            if (fly_start_recording) fly_start_recording.style.display = 'block';
            if (inputContainer) inputContainer.style.display = 'flex';
            if (resultContainer) resultContainer.style.display = 'block';
            if (keywordContainer) keywordContainer.style.display = 'block';

            
            correctAnswers = 0;
            updateLevelInfo();
        } else {
            console.error('Failed to start game:', response.status);
        }
    }
}

function updateLevelInfo() {
    const level = getLevel(currentLevel);
    document.getElementById('current-level').innerText = level.number;
    document.getElementById('level-target').innerText = level.target;
    document.getElementById('correct-answers').innerText = correctAnswers;
}

function showRules() {
    // 创建一个模态框或弹窗来显示规则
    const rulesModal = document.createElement('div');
    rulesModal.id = 'rules-modal';
    rulesModal.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    const rulesContent = `
        <div style="background: #fff; padding: 20px; border-radius: 5px;">
            <h2>游戏规则介绍</h2>
            <p><strong>角色介绍：</strong></p>
            <ul>
                <li>主持人Agent：每轮游戏开始会从中国古典诗词常见意象的关键字中随机选择出题</li>
                <li>评审官Agent：根据主持人提供的关键字和用户提供的诗句，判断是否回答正确</li>
                <li>对手Agent：和用户对垒，确保回答来自中国古诗词且包含关键字，不能和之前重复</li>
            </ul>
            <p><strong>规则介绍：</strong></p>
            <ol>
                <li>必须来自中国古诗词；</li>
                <li>必须包含主持人提供的关键字；</li>
                <li>不能和之前的诗句重复。</li>
            </ol>
            <button onclick="closeRulesModal()">我知道了</button>
        </div>
    `;

    rulesModal.innerHTML = rulesContent;
    document.body.appendChild(rulesModal);
}

function closeRulesModal() {
    const rulesModal = document.getElementById('rules-modal');
    if (rulesModal) rulesModal.remove();
}

function showLevelOverlay() {
    const overlay = document.getElementById('level-overlay');
    const levelText = document.getElementById('overlay-current-level');
    const levelImage = document.getElementById('level-image');

    levelText.innerText = currentLevel;
    

    overlay.style.display = 'flex';
}

function hideLevelOverlay() {
    const overlay = document.getElementById('level-overlay');
    overlay.style.display = 'none';
}

function nextLevel() {
    hideLevelOverlay();
    currentLevel++;
    correctAnswers = 0;
    updateLevelInfo();
    startGame(false); // 开始下一关
}

async function submitResponse() {
    const userInput = document.getElementById('user-input').value;
    document.getElementById('user-input').value = '';

    if (!(userInput.includes(currentKeyword) && userInput.length >= 5)) {
        alert('输入的答案不符合规则，请重新输入');
        return;
    }

    const response = await fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_response: userInput, keyword: currentKeyword }),
    });

    if (response.ok) {
        const data = await response.json();

        const chatContainer = document.getElementById('chat-container');

        // 添加用户的回复
        const userMessage = document.createElement('div');
        userMessage.className = 'message user';
        userMessage.innerHTML = `<div class="message-content">用户: ${userInput}</div>`;
        chatContainer.appendChild(userMessage);

        // 添加 AI 的回复
        const aiMessage = document.createElement('div');
        aiMessage.className = 'message ai';
        aiMessage.innerHTML = `<div class="message-content">AI选手: ${data.ai_response}</div>`;
        chatContainer.appendChild(aiMessage);

        // 滚动到最新消息
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // 更新评审结果
        document.getElementById('judge-result').innerText = data.judge_result;
        console.log(data.judge_result);
        if (data.judge_result === '用户正确! AI选手: 正确!') {
            correctAnswers++;
            updateLevelInfo();
            if (correctAnswers >= levels[currentLevel - 1].target) {
                showLevelOverlay();
            }
        }
    } else {
        console.error('Failed to submit response:', response.status);
    }
}


const socket = io();
canPush = true

function startRecordingFly() {
    console.log('Start recording clicked');
    canPush = false;
    socket.emit('startRecordingFly');
}
function sendMessageWithResultFly(result) {
  const message = result; // 使用识别结果作为消息
  document.getElementById('user-input').value = message;
  sendMessage();
}
socket.on('audio_recognizedFly', (data) => {
    //console.log('audio_recognized', data);
    console.log('audio_recognizedFly');
    const result = data.result;
    sendMessageWithResultFly(result);
    canPush = true
  })