document.addEventListener('DOMContentLoaded', function () {
    const socket = io();
    // 创建蒙版元素
    var overlay = document.createElement('div');
    overlay.classList.add('overlay');
    document.body.appendChild(overlay);

    // 获取容器元素
    var container = document.getElementById('nine');
    for (var key in questionsOfGridData) {
        var cardHtml = `<img src="/static/image/backgroundAd.jpg" alt="Play Image" width="200" height="150">`;
        var button = document.createElement('div');
        button.innerHTML = cardHtml;
        container.appendChild(button);

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
                closeButton.addEventListener('click', function () {
                    overlay.style.display = 'none';
                    overlay.innerHTML = ''; // 清空 overlay 内容
                    answerArray = [];
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

                var timer = setTimeout(function () {
                    console.log(1)
                    // 超时处理
                    if (mode == 1) {
                        checkAnswer(topic.answer.trim().substring(3), document.getElementById('answer'), key);
                    }                    
                    answerArray = [];
                }, 10000); // 10秒 = 10000毫秒

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
    var buttons = answerContainer.querySelectorAll('button');
    buttons.forEach(function (btn) {
        btn.disabled = true;
    });
    var buttons = document.querySelectorAll('.grid-item button');
    buttons.forEach(function (button) {
        button.disabled = true;
    });
    finalScore(isWin, key);
}

function finalScore(isWin, key) {
    var board = document.getElementById(`board-${key}`);
    console.log(key);

    if (isWin == 1) {
        var win = document.createElement('div');
        win.innerHTML = "恭喜，回答正确";
        board.appendChild(win);
    }
    else {
        var lose = document.createElement('div');
        lose.innerHTML = "很遗憾，回答错误，再接再厉！";
        board.appendChild(lose);

    }
}