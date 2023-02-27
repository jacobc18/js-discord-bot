const fs = require('fs');
const path = require('path');

const cmdsWhichHandleOwnSubCmds = ['admin'];

const handlesOwnSubCmds = (filePath) => {
    return cmdsWhichHandleOwnSubCmds.find(cmd => filePath.endsWith(cmd));
}; 

module.exports = function readCommandFiles(directory, commandList = []) {
    const files = fs.readdirSync(directory);
    
    files.forEach(file => {
        const filePath = path.join(directory, file);
        if(fs.lstatSync(filePath).isDirectory() && !handlesOwnSubCmds(filePath)) {
            readCommandFiles(filePath, commandList);
        } else if (filePath.endsWith('.js')) {
            commandList.push(filePath);
        }
    });

    return commandList;
}