const fs = require('fs');
const greetingsData = require('../data/greetings.json');
const speakText = require('../utils/speakText');
const getRandomBetween = require('../utils/getRandomBetween');
const connectAndPlayAudioFile = require('../utils/connectAndPlayAudioFile');
const logger = require('../utils/logger');

const AUDIOFILES_DIR_PATH = './data/audioFiles';

module.exports = function(client, oldState, newState) {
    if (newState.id === process.env.CLIENT_ID) return;
  
    if (oldState.channelId === newState.channelId) return;
  
    const channelId = newState.channelId;
    if (!channelId) return;
  
    const memberId = newState.id;
    const member = newState.guild.members.cache.get(memberId);

    if (member.user.bot) return;

    const greetingsObj = greetingsData[memberId] || greetingsData.default;
    const memberGreetings = greetingsObj.greetings;

    let randomMemberGreeting =
        memberGreetings[getRandomBetween(0, memberGreetings.length - 1)]
        .replaceAll('*NAME*', `${member.nickname || member.user.username || ''}`);
    
    const channel = client.channels.cache.get(channelId);

    // handle rare greeting
    const sixtyNinersData = require('../data/69ers.json');
    const sixtyNinersMemberData = sixtyNinersData[memberId];

    if (sixtyNinersMemberData) {
        const timestamp = new Date().getTime();
        const sevenAndAHalfHours = 27000000; // 6 hours and 90 minutes
        if (timestamp - sixtyNinersMemberData.timestamp >= sevenAndAHalfHours && getRandomBetween(1, 69) === 69) {
            // member hit the rare greeting!
            randomMemberGreeting = '*NAME* has earned the right to 69 with me'
                .replaceAll('*NAME*', `${member.nickname || member.user.username || ''}`);
            if (sixtyNinersMemberData.earned > 0) {
                randomMemberGreeting += ` ${sixtyNinersMemberData.earned + 1} times`;
            }
            sixtyNinersData[memberId] = {
                timestamp,
                earned: sixtyNinersMemberData.earned + 1
            }
            fs.writeFileSync('./data/69ers.json', JSON.stringify(sixtyNinersData, null, 2));
        }
    } else {
        sixtyNinersData[memberId] = {
            timestamp: new Date().getTime(),
            earned: 0
        }
        fs.writeFileSync('./data/69ers.json', JSON.stringify(sixtyNinersData, null, 2));
    }

    logger.log(`GREET user: ${member.user.username} | channel: ${channel} | ${randomMemberGreeting}`);

    if (randomMemberGreeting.includes('*AUDIOFILE*')) {
        const audioFileName = randomMemberGreeting.split('*AUDIOFILE*')[1];
        connectAndPlayAudioFile(channel, `${AUDIOFILES_DIR_PATH}/${audioFileName}`);
        return;
    }
    
    speakText(channel, randomMemberGreeting);
};