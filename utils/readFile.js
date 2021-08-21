const readline = require('readline');
const fs = require('fs');

module.exports = function readFile(file, lineFunc) {
    return new Promise((res, rej) => {
        try {
            var readInterface = readline.createInterface({
                input: fs.createReadStream(file),
                terminal: false
            });

            readInterface
                .on('line', function (line) {
                    lineFunc(line);
                })
                .on('close', function () {
                    res();
                });
        } catch(err){
            rej(err)
        }
    });
};
