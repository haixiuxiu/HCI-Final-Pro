document.addEventListener('DOMContentLoaded', function () {
    // 获取容器元素
    var container = document.getElementById('nine');
    // 遍历questionsOfGridData
    questionsOfGridData.forEach(function (topic) {
        var containerOfTopic = document.createElement('div');
        containerOfTopic.className = 'grid-item';
        for (var i = 0; i < topic.title.length; i++) {
            var row = document.createElement('div');
            for (var j = 0; j < topic.title[i].length; j++) {
                var button = document.createElement('button');
                button.innerText = topic.title[i][j];
                row.appendChild(button);
            }
            containerOfTopic.appendChild(row);
        }
        container.appendChild(containerOfTopic);
    });
});