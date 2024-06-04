document.addEventListener('DOMContentLoaded', function(poemsData) {
    // 创建蒙版元素
    var overlay = document.createElement('div');
    overlay.classList.add('overlay');
    document.body.appendChild(overlay);

    // 获取容器元素
    var container = document.getElementById('cards-container');
    // 循环遍历诗歌数据并生成卡片
    for(var key in window.poemsData) {
        if (window.poemsData.hasOwnProperty(key)) {
            var poem = window.poemsData[key];
            console.log(poem);
            var cardHtml = `
                <button class="card" data-index="${key}">
                    <h2>${poem.title}</h2>
                    <h3>${poem.author}</h3>
                    <p>${poem.content}</p>
                </button>
            `;
            var button = document.createElement('div');
            console.log(button);
            button.innerHTML = cardHtml;

            // 使用立即执行函数将 key 和 poem 传递到闭包中
            (function (key, poem) {
                button.addEventListener('click', function () {
                    console.log('123456');
                    overlay.style.display = 'block';

                    // 在蒙版上添加所需的内容或操作界面
                    overlay.innerHTML = `
                        <div class="overlay-content">
                            <h2>${poem.title}</h2>
                            <h3>${poem.author}</h3>
                            <p>${poem.content}</p>
                            <button id="start-recitation-btn">开始背诵</button>
                            <button id="close-btn">关闭</button>
                        </div>
                    `;
                    // 开始背诵按钮的点击事件监听器
                    document.getElementById('start-recitation-btn').addEventListener('click', function () {
                        // 在这里执行开始背诵的操作
                        console.log('开始背诵:', poem.title);
                        const socket = io();
                        answer = poem.title + poem.author + poem.content;
                        socket.emit('beginRecite', answer);
                        // 可以添加更多操作，比如跳转到背诵页面等
                    });
                    // 关闭蒙版按钮的点击事件监听器
                    document.getElementById('close-btn').addEventListener('click', function () {
                        // 隐藏蒙版
                        overlay.style.display = 'none';
                    });
                });
            })(key, poem);

            container.appendChild(button);
        }
    }
});
