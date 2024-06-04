document.addEventListener('DOMContentLoaded', function () {
    var reader = new FileReader();
    var filePath = '/static/daily.txt'; 
    fetch(filePath)
        .then(response => response.blob())
        .then(blob => {
            reader.readAsText(blob);
            reader.onload = function () {
                var content = reader.result;
                var lines = content.split('\n'); // 按行分割文件内容
                var objList = []; // 用于存储结果对象的数组

                // 遍历文件的每一行
                for (var i = 0; i < lines.length; i += 3) {
                    var firstObj = {
                        type: "name",
                        content: lines[i]
                    };
                    var secondObj = {
                        type: "interpret",
                        content: lines[i + 1]
                    };
                    var thirdObj = {
                        type: "example",
                        content: lines[i + 2]
                    };
                    var combinedObj = {
                        first: firstObj,
                        second: secondObj,
                        third: thirdObj
                    };
                    // 将大对象添加到列表中
                    objList.push(combinedObj);
                }
                displayContent(objList);
            }
        })
        .catch(error => {
            console.error('Error fetching file:', error);
        });
});

function displayContent(objList) {
    // 随机选择一个对象
    var randomIndex = Math.floor(Math.random() * objList.length);
    var randomObj = objList[randomIndex];
    console.log(randomObj); 
    // 显示随机选择的对象内容
    var randomContentDiv = document.getElementById('random-content');
    randomContentDiv.innerHTML = `
        <h2>${randomObj.first.content}</h2>
        <h3>${randomObj.second.content}</h3>
        <p>${randomObj.third.content}</p>
    `;

}
