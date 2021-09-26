const fs = require('fs');
const users = require('../data/users.json');
const speakText = require('../utils/speakText');
const getRandomBetween = require('../utils/getRandomBetween');
const connectAndPlayAudioFile = require('../utils/connectAndPlayAudioFile');
const createGuildData = require('../utils/createGuildData');
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

    // don't greet someone if the musicPlayer is playing
    let player = client.musicPlayerManager.get(newState.guild.id);

    if (player && player.nowPlaying) return;
    
    const memberData = users[memberId];

    if (!client.guildData.get(newState.guild.id)) {
        client.guildData.set(newState.guild.id, createGuildData(newState.guild.id));
    }

    const guildData = client.guildData.get(newState.guild.id);
    const defaultGreetings = guildData.greetings;

    const memberGreetings = memberData?.greetings || defaultGreetings;

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

    logger.log(`GREET user: ${member.user.username} | channel: ${member.voice.channel.name} | ${randomMemberGreeting}`);

    if (randomMemberGreeting.includes('*AUDIOFILE*')) {
        const audioFileName = randomMemberGreeting.split('*AUDIOFILE*')[1];
        connectAndPlayAudioFile(channel, `${AUDIOFILES_DIR_PATH}/${audioFileName}`);
        return;
    }
    
    speakText(channel, randomMemberGreeting);
};