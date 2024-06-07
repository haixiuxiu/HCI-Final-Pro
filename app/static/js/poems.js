document.addEventListener('DOMContentLoaded', function (poemsData) {
    document.getElementById('nav-beisong').classList.add('selected');
    const socket = io();
    // 创建蒙版元素
    var overlay = document.createElement('div');
    overlay.classList.add('reciteOverlay');
    document.body.appendChild(overlay);

    // 获取容器元素
    var container = document.getElementById('cards-container');
    // 循环遍历诗歌数据并生成卡片
    for (var key in window.poemsData) {
        if (window.poemsData.hasOwnProperty(key)) {
            var wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            wrapper.style.alignItems = 'center';
            wrapper.style.width = '200px';

            var poem = window.poemsData[key];
            var index = parseInt(key, 10) + 1;
            var cardHtml = `<img src="/static/image/recite${index}.jpg" alt="Poem Image" class="shadow-image" style="border-radius: 20px;" width="200" height="150">`;


            starsContainer = document.createElement('div');
            starsContainer.className = 'stars';
            for (let j = 0; j < 3; j++) {
                star = document.createElement('i');
                star.id = `star-${key}-${j}`;
                star.className = 'fas fa-star star';
                starsContainer.appendChild(star);
            }

            var button = document.createElement('div');
            button.id = `${key} `;
            button.innerHTML = cardHtml;

            wrapper.appendChild(button);
            wrapper.appendChild(starsContainer);

            container.appendChild(wrapper);

            // 使用立即执行函数将 key 和 poem 传递到闭包中
            (function (key, poem) {
                button.addEventListener('click', function () {
                    overlay.style.display = 'block';
                    // 在蒙版上添加所需的内容或操作界面
                    var content = `
                        <div class="reciteOverlay-content">
                        <div id ="content">
                            <h2 style="text-align: center;">${poem.title}</h2>
                            <h3 style="text-align: center;">${poem.author}</h3>
                            <p>${poem.content}</p>
                        </div>
                        <div style="text-align: center;">
                            <button id="start-recitation-btn" :disabled = canStart>开始背诵</button>
                            <button id="close-btn" :disabled = canClose>关闭</button>
                        </div>
                    `;



                    overlay.innerHTML = content;
                    // 开始背诵按钮的点击事件监听器
                    document.getElementById('start-recitation-btn').addEventListener('click', function () {
                        //给出提示
                        var contentDiv = document.getElementById('content');
                        contentDiv.innerHTML = '在倒计时结束后请开始背诵，注意，您的背诵时间只有15s。准备好了吗？让我们开始吧！';
                        var countdown = document.createElement('div');
                        countdown.style.width = "80px";  // 设置宽度
                        countdown.style.height = "40px";  // 设置高度
                        countdown.style.position = "absolute";
                        countdown.style.top = "70%";  // Center vertically
                        countdown.style.left = "90%";
                        countdown.style.transform = "translate(-50%, -50%)";
                        countdown.style.backgroundImage = "url('/static/image/3.gif')";
                        countdown.style.backgroundSize = "cover";
                        contentDiv.appendChild(countdown);
                        //背诵期间禁用按键
                        document.getElementById('start-recitation-btn').disabled = true;
                        document.getElementById('close-btn').disabled = true;

                        setTimeout(function () {
                            // 在这里执行开始背诵的操作
<<<<<<< HEAD
=======
                            console.log('开始背诵:', poem.title);
                            console.log('/static/image/recite.gif');

>>>>>>> 5c55df771d9040d7e2955b719fdaf5f305d8ecee
                            var contentDiv = document.getElementById('content');
                            contentDiv.innerHTML = `<img src="/static/image/recite.gif" alt="Poem Image">`;


                            const socket = io();
                            answer = poem.title + poem.author + poem.content;
                            socket.emit('beginRecite', answer);
                            setTimeout(function () {
                                countdown.style.width = "78px";  // 设置宽度
                                countdown.style.height = "38px";  // 设置高度
                                countdown.style.position = "absolute";
                                countdown.style.top = "95%";  // Center vertically
                                countdown.style.left = "92%";
                                countdown.style.transform = "translate(-50%, -50%)";
                                countdown.style.backgroundImage = "url('/static/image/5.gif')";
                                countdown.style.backgroundSize = "cover";
                                contentDiv.appendChild(countdown);

                                setTimeout(function () {
                                    countdown.parentNode.removeChild(countdown);
                                }, 5000);

                            }, 13000)


                            socket.on('recite_end', (reward) => {
                                console.log(reward);
                                document.getElementById('start-recitation-btn').disabled = false;
                                document.getElementById('close-btn').disabled = false;
                                mark(key, reward);
                                feedback(reward);
                                //overlay.style.display = 'none';
                            });
                        }, 3000);
                    });
                    // 关闭蒙版按钮的点击事件监听器
                    document.getElementById('close-btn').addEventListener('click', function () {
                        // 隐藏蒙版
                        overlay.style.display = 'none';
                    });
                });
            })(key, poem);

            //container.appendChild(button);
        }
    }
});

function mark(key, reward) {
    for (var i = 0; i < reward; i++) {
        var star = document.getElementById(`star-${key}-${i}`);
        star.classList.add('rated');
    }
}

function feedback(reward) {
    var jiaohu = document.getElementById('content');
    var score = document.getElementById('score');
    if (!score) {
        var score = document.createElement('span');
        score.id = 'score';
        score.className = 'score';
    }
    console.log(reward);
    if (reward == 3) {
        score.style.color = 'red';
        score.innerHTML = '完全正确！';
    }
    else if (reward == 2) {
        score.innerHTML = '有一点小错误,请再接再厉！';
    }
    else if (reward == 1) {
        score.innerHTML = '错误较多，请继续努力！';
    }
    else {
        score.innerHTML = '很遗憾哦~再试一次吧！';
    }
    jiaohu.appendChild(score);
}