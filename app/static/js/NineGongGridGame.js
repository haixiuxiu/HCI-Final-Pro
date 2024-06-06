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
                overlay.style.display = 'flex';
                // 在蒙版上添加所需的内容或操作界面
                var board = document.createElement('div');
                board.className = 'boardOfNine';
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
                    }
                    containerOfTopic.appendChild(row);
                }
                // 答题区
                var answer = document.createElement('div')
                answer.innerHTML = '落花时节又逢君';
                board.appendChild(containerOfTopic);
                board.appendChild(answer);
                //overlay.innerHTML = containerOfTopic;
                overlay.appendChild(board); // 注意这里是添加到 overlay 中
            }); // 注意这里添加了闭合括号
        })(key);
    }
});
