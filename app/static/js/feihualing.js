document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('nav-feihualing').classList.add('selected');
})

let currentKeyword = '';

async function startGame() {
    // 首先显示规则介绍
    showRules();
    
    // 等待用户阅读规则后，再开始游戏
    const start = confirm('请阅读并理解规则后点击确定开始游戏');
    if (start) {
      const response = await fetch('/start');
      if (response.ok) {
        const data = await response.json();
        currentKeyword = data.keyword;
        document.getElementById('current-keyword').innerText = currentKeyword;
        document.getElementById('judge-result').innerText = '';
        document.getElementById('ai-output').innerText = '';
        document.getElementById('user-input').value = '';
        // 游戏开始后可能还需要其他逻辑
      } else {
        console.error('Failed to start game:', response.status);
      }
    }
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
// 关闭规则模态框的函数
function closeRulesModal() {
    document.getElementById('rules-modal').remove();
  }

async function submitResponse() {
    const userInput = document.getElementById('user-input').value;
    document.getElementById('user-input').value = '';
    console.log(userInput);
    console.log(currentKeyword);
    console.log(userInput.length);
    console.log(currentKeyword.includes(userInput));
    if (!(userInput.includes(currentKeyword) && userInput.length >= 5)) {
        // 你的代码逻辑
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

    const data = await response.json();
    document.getElementById('judge-result').innerText = data.judge_result;
    document.getElementById('ai-output').innerText = data.ai_response;
}
