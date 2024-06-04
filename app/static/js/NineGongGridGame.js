// 获取容器元素
var container = document.getElementById('nine');
// 遍历questionsOfGridData
questionsOfGridData.forEach(function(topic) {
    var containerOfTopic = document.createElement('div');
    containerOfTopic.className = 'grid-item';
    for (var i = 0; i < 3; i++) {
        var row = document.createElement('div');
        for (var j = 0; j < 3; j++) {
            var button = document.createElement('button');
            button.innerText = topic.title[i][j];
            row.appendChild(button);
        }
        containerOfTopic.appendChild(row);
    }
    container.appendChild(containerOfTopic); 
});

