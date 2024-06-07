document.addEventListener('DOMContentLoaded',function(){
    document.getElementById('nav-chuangguan').classList.add('selected');
  })

document.addEventListener('DOMContentLoaded', function () {
    const socket = io();
    // 创建蒙版元素
    var overlay = document.createElement('div');
    overlay.classList.add('overlay');
    document.body.appendChild(overlay);

    // 获取容器元素
    var container = document.getElementById('nine');
    for (var key in questionsOfGridData) {
        var wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column'; 
        wrapper.style.alignItems = 'center'; 
        wrapper.style.width = '200px';

        var index = parseInt(key,10);
        var cardHtml = `<img src="/static/image/game${index+1}.png" alt="Play Image" style="border-radius: 20px;" width="200" height="150">`;
        var button = document.createElement('div');
        button.innerHTML = cardHtml;
        button.style.marginBottom = '10px';

        var state = document.createElement('div');
        state.id=`state-${key}`;
        state.style.backgroundImage = "url(/static/image/before.png)";
        state.style.width = "30px"; 
        state.style.height = "30px"; 
        state.style.backgroundSize = "contain"; // 确保图片完全显示
        state.style.backgroundRepeat = "no-repeat";
        state.style.backgroundPosition = "center";
       
        wrapper.appendChild(button);
        wrapper.appendChild(state);

        container.appendChild(wrapper);

        // 使用立即执行函数将 key 传递到闭包中
        (function (key) {
            button.addEventListener('click', function () {
                // 确定答题模式
                var modeButton = document.getElementById('modeSelect');
                var mode = modeButton.classList.contains('flipped') ? 0 : 1;
                overlay.style.display = 'flex';
                // 在蒙版上添加所需的内容或操作界面
                var board = document.createElement('div');
                board.id = `board-${key}`;
                board.className = 'boardOfNine';

                // 添加关闭按钮
                var closeButton = document.createElement('button');
                closeButton.className = 'close-button';
                closeButton.innerHTML = '&times;';
                var timer;
                closeButton.addEventListener('click', function () {
                    overlay.style.display = 'none';
                    overlay.innerHTML = ''; // 清空 overlay 内容
                    answerArray = [];
                    socket.off('speak_end'); 
                    if(timer){
                        clearTimeout(timer);
                    }
                });
                board.appendChild(closeButton);

                // 题目部分
                var containerOfTopic = document.createElement('div');
                containerOfTopic.className = 'grid-item';
                var topic = questionsOfGridData[key];
                for (var i = 0; i < topic.title.length; i++) {
                    var row = document.createElement('div');
                    for (var j = 0; j < topic.title[i].length; j++) {
                        var button = document.createElement('button');
                        button.innerText = topic.title[i][j];
                        row.appendChild(button);
                        (function (text, modelAnswer, key) {
                            button.addEventListener('click', function () {
                                if (mode == 1) {
                                    addToAnswer(text, modelAnswer, key);
                                }
                                
                            });
                        })(topic.title[i][j], topic.answer, key);
                    }
                    containerOfTopic.appendChild(row);
                }
                // 答题区
                var answer = document.createElement('div')
                answer.id = 'answer';
                answer.className = 'answer';

                // 语音模式
                if (mode == 0) {
                    console.log(key);
                    socket.emit('beginSpeak', topic.answer);
                    socket.off('speak_end');
                    socket.on('speak_end', (reward) => {
                        if (reward == 1) {
                            isWin = 1;
                        }
                        else {
                            isWin = 0;
                        }
                        finalScore(isWin, key);
                    });
                }

                (function (key, topic, mode) {
                    timer = setTimeout(function () {
                        // 超时处理
                        if (mode == 1 && !document.getElementById('win') && !document.getElementById('lose')) {
                            checkAnswer(topic.answer.trim().substring(3), document.getElementById('answer'), key);
                        }
                        answerArray = [];
                    }, 10000); 
                })(key, topic, mode);

                board.appendChild(containerOfTopic);
                board.appendChild(answer);

                overlay.appendChild(board);
            });
        })(key);
    }
});

//点击模式
function addToAnswer(text, answer, key) {
    answer = answer.trim();
    console.log(key);
    answer = answer.substring(3);
    var answerContainer = document.getElementById('answer');
    var button = document.createElement('button');
    button.innerText = text;
    button.style.background='linear-gradient(to bottom, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0))';

    console.log(answerContainer);

    button.addEventListener('click', function () {
        removeFromAnswer(button);
    });

    answerContainer.appendChild(button);
    answerArray.push(text);

    console.log(answer.length);
    if (answer.length == answerArray.length) {
        checkAnswer(answer, answerContainer, key);
    }
}

function removeFromAnswer(button) {
    var index = answerArray.indexOf(button.innerText);
    if (index > -1) {
        answerArray.splice(index, 1);
    }
    button.remove();
}

function checkAnswer(modelAnswer, answerContainer, key) {
    var answerString = "";
    for (var i = 0; i < answerArray.length; i++) {
        answerString += answerArray[i];
    }
    var isWin = 0;
    if (answerString == modelAnswer) {
        isWin = 1;
    }
    else {
        isWin = 0;
    }

    console.log(answerContainer);

    var buttons = answerContainer.querySelectorAll('button');
    buttons.forEach(function (btn) {
        btn.disabled = true;
    });

    var containerOfTopic = document.querySelector(`#board-${key} .grid-item`);
    if (containerOfTopic) {
        var buttons = containerOfTopic.querySelectorAll('button');
        buttons.forEach(function (button) {
            button.disabled = true;
        });
    }
    finalScore(isWin, key);
}

function finalScore(isWin, key) {
    var board = document.getElementById(`board-${key}`);

    if (isWin == 1) {
        var state = document.getElementById(`state-${key}`);
        state.style.backgroundImage = 'url(/static/image/win.png)';
        console.log(state);
        var win = document.createElement('div');
        win.id = 'win';
        win.innerHTML = "恭喜，回答正确!";
        win.className="chenggong";
        
        board.appendChild(win);
    }
    else {
        var lose = document.createElement('div');
        lose.id = 'lose';
        lose.innerHTML = "很遗憾，未能正确作答，再接再厉！";
        lose.className = "shibai";
        board.appendChild(lose);
    }
}