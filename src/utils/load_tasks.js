
const fs = require('fs');
const path = require('path');

function findJSFiles(dir) {
    const files = fs.readdirSync(dir);
    const jsFiles = [];
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            jsFiles.push(...findJSFiles(fullPath));
        } else if (file.endsWith('.js')) {
            jsFiles.push(fullPath);
        }
    }
    return jsFiles;
}
function loadTasks(dir){
    const taskFiles = findJSFiles(dir);
    return taskFiles.map(file => {
        return require(file);
    });
}

module.exports = {
    loadTasks
}

