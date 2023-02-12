const fs = require('fs');
const path = require('path');

module.exports = function readCommandFiles(directory, commandList = []) {
    const files = fs.readdirSync(directory);
    
    files.forEach(file => {
        const filePath = path.join(directory, file);
        if(fs.lstatSync(filePath).isDirectory() && !filePath.endsWith('admin')) {
            readCommandFiles(filePath, commandList);
        } else if (filePath.endsWith('.js')) {
            commandList.push(filePath);
        }
    });

    return commandList;
}