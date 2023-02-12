const { MessageActionRow, MessageButton } = require('discord.js');
const logger = require('../../utils/logger');

const exampleCommand = '`!createPoll -p "What is your favorite type of sandwich?" -o 1) taco style 2) hotdog style 3) sandwich style`';
// const replyTimeMS = 30000;
// const TIME_ERROR = 'time';

module.exports = {
    data: {
        name: 'createPoll',
        type: 'text'
    },
    async execute(message) {
        const guildId = message.guildId;
        const userName = message.member.user.username;
        const userId = message.member.user.id;
        logger.log(`!CREATEPOLL user: ${userName} | guildId: ${guildId}`);
        let [doPoll, outputStr] = parseArgs(message.content);
        let error = null;
        // commenting out the dm'ing portion since this blocks all bot activity for 30 seconds.
        //  - will need to deal with this somehow to allow a feature like this - not sure *how* yet.
        // if (doPoll) {
        //     await message.channel.send(`I'm direct messaging you to verify this poll.`);
        //     await message.author.send(`Here is your poll:\n${outputStr}\nDoes this look good? You have ${replyTimeMS / 1000} seconds to respond.`);
        //     await message.author.dmChannel.awaitMessages({
        //         max: 1,
        //         time: replyTimeMS,
        //         errors: [TIME_ERROR]
        //     }).then((response) => {
        //         if (response.first().content.toUpperCase().startsWith('Y')) {
        //             message.author.dmChannel.send('Your poll has been posted.');
        //             logger.log(`${userName} has created a public poll. | guildId: ${guildId}\n`);  
        //         } else {
        //             message.author.dmChannel.send('Your poll was not posted');
        //             outputStr = 'Poll not posted.';
        //         }
        //     }).catch(() => {
        //         message.author.send('I didn\'t receive an answer in time OR an error occurred. Poll not posted.');
        //         error = TIME_ERROR;
        //     }); 
        // } 
        if (doPoll && outputStr !== '' && !error) {
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId(`cmd:deleteMsg ${userId}`)
                        .setLabel('delete poll')
                        .setStyle('DANGER')
                );
            // await message.channel.send(`${outputStr}`);
            await message.channel.send({
                content: outputStr,
                components: [row]
            });

        } else if (error) {
            await message.channel.send(`Poll not posted.`);
        }
    }
};

const parseArgs = (args) => {
    let outputStr = '';
    const argsList = args.split(' ');
    const firstArg = argsList[1]?.toLowerCase() || '-h';
    if (firstArg === '-h' || firstArg === '-help') {
        outputStr = 'Create a poll with `!createPoll -p "Poll question here in quotes." -o 1) option1 2) option2 3) option3`\n' +
        'You may have up to 9 options. Here\'s an example:\n' + exampleCommand;

        return [false, outputStr];
    } else if (firstArg !== '-p' && firstArg !== '-poll') {
        outputStr = 'You must give me the Poll question with \'-p\'.\nExample:' + exampleCommand;

        return [false, outputStr];
    } else {
        let pollQuestion = '';
        let temp = args.match(/"[^"]*"/g);
        if (!temp) {
            outputStr = 'No poll question found. You need to give me a poll question in double-quotes after \'-p\'.\n' +
            'Example:\n' + exampleCommand;

            return [false, outputStr];
        } else {
            pollQuestion = temp[0];
        }
        outputStr = outputStr.concat(pollQuestion);
        let argsIdx = pollQuestion.split(' ').length + 2;
        let optionsArg = argsList[argsIdx]?.toLowerCase() || null;
        if (optionsArg !== '-o' && optionsArg !== '-options') {
            outputStr = 'You need to give options with \'-o\' after your question.\n' +
            'Example:\n' + exampleCommand;

            return [false, outputStr];
        } else {
            argsIdx++;
        }

        if (argsList[argsIdx] !== '1)') {
            outputStr = 'Improperly numbered poll options. You need to give me numbered poll options after \'-o\'.\n' +
            'Example:\n' + exampleCommand;

            return [false, outputStr];
        } else {
            outputStr = outputStr.concat('\n');
        }

        for (let i = 1; argsIdx < argsList.length && i < 9; argsIdx++) {
            if (argsList[argsIdx] === (i + ')')) {
                outputStr = outputStr.concat('\n' + pollEmojis[i] + ' - ');
                i++;
            } else {
                outputStr = outputStr.concat(argsList[argsIdx] + ' ');
            }
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