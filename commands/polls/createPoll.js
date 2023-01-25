const logger = require('../../utils/logger');

module.exports = {
    data: {
        name: 'createPoll',
        type: 'text'
    },
    
    async execute(message) {
        const guildId = message.guildId;
        const userName = message.member.user.username;
        logger.log(`!createPoll user: ${userName} | guildId: ${guildId}`);
        let [doPoll, outputStr] = parseArgs(message.content);
        if (doPoll) {
            await message.author.send('Here is your poll:\n' + outputStr + '\nDoes this look good?');
            await message.author.dmChannel.awaitMessages({
                max: 1,
                time: 180000,
                errors: ['time']
            }).then((response) => {
                if (response.first().content.toUpperCase().startsWith('Y')) {
                    message.author.dmChannel.send('Your poll has been posted.');
                    logger.log(`${userName} has created a public poll. | guildId: ${guildId}\n`);  
                } else {
                    message.author.dmChannel.send('Your poll was not posted');
                    outputStr = 'Poll not posted.';
                    return;
                }
            }).catch(() => {
                message.author.send('Something went wrong! Poll not posted.');
                return;
            }); 
        } 
        if (outputStr != '') {
            await message.channel.send(`${outputStr}`);
        }
    }

};

const parseArgs = (args) => {
    let outputStr = '';
    const argsList = args.split(' ');
    if (argsList[1] == '-h') {
        outputStr = 
        'Create a poll with !createPoll -p "Poll question here in quotes." -o Poll options here listed by number 1) x 2) y 3) ...\n' +
        'You may have up to 9 options. Here\'s an example:\n' +
        '!createPoll -p "What is your favorite type of sandwhich?" -o 1) taco style 2) hotdog style 3) sandwhich style\n';
        return [false, outputStr];
    } else if (argsList[1] != '-p') {
        outputStr = 'You must give Pastrami the Poll question with \'-p\'.';
        return [false, outputStr];
    } else {
        let temp = args.match(/"[^"]*"/g);
        let pollQuestion = ''
        if (!temp) {
            outputStr = 'No poll question found. You need to give Pastrami a poll quesiton in double-quotes after \'-p\'.\n' +
            'Example:\n' +
            '!createPoll -p "What is your favorite type of sandwich?" -o 1) taco style 2) hotdog style 3) sandwich style\n';
            return [false, outputStr];
        } else {
            pollQuestion = temp[0];
        }
        outputStr = outputStr.concat(pollQuestion);
        let argsIdx = pollQuestion.split(' ').length + 2;
        if (argsList[argsIdx] != '-o') {
            outputStr = 
            'You need to give options with \'-o\' after your question.\n' +
            'Example:\n' +
            '!createPoll -p "What is your favorite type of sandwich?" -o 1) taco style 2) hotdog style 3) sandwich style\n';
            return [false, outputStr];
        } else {
            argsIdx++;
        }

        if (argsList[argsIdx] != '1)') {
            outputStr = 
            'Improperly numbered poll options. You need to give Pastrami numbered poll options after \'-o\'.\n' +
            'Example:\n' +
            '!createPoll -p "What is your favorite type of sandwich?" -o 1) taco style 2) hotdog style 3) sandwich style\n';
            return [false, outputStr];
        } else {
            outputStr = outputStr.concat('\n');
        }
        for (let i = 1; argsIdx < argsList.length && i < 9; argsIdx++) {
            if (argsList[argsIdx] == (i + ')')) {
                outputStr = outputStr.concat('\n' + pollEmojis[i] + ' - ');
                i++;
                continue;
            }
            outputStr = outputStr.concat(argsList[argsIdx] + ' ');
        }
    }

    return [true, outputStr];
};

const pollEmojis = {
    1: '\:one:',
    2: '\:two:',
    3: '\:three:',
    4: '\:four:',
    5: '\:five:',
    6: '\:six:',
    7: '\:seven:',
    8: '\:eight:',
    9: '\:nine:',
};