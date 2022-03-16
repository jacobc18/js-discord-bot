const NODE_ENV = process.env.NODE_ENV;
const isProduction = NODE_ENV.includes('production');

const fs = require('fs');
const users = require('../data/users.json');
const speakText = require('../utils/speakText');
const getRandomBetween = require('../utils/getRandomBetween');
const connectAndPlayAudioFile = require('../utils/connectAndPlayAudioFile');
const createGuildData = require('../utils/createGuildData');
const logger = require('../utils/logger');

const AUDIOFILES_DIR_PATH = './data/audioFiles';

const BOT_OWNER_ID = '189181051216592896';

module.exports = async function(client, oldState, newState) {
    if (newState.id === process.env.CLIENT_ID) return;
  
    if (oldState.channelId === newState.channelId) return;
  
    const channelId = newState.channelId;
    if (!channelId) return;
  
    const memberId = newState.id;
    const member = newState.guild.members.cache.get(memberId);

    if (memberId === '148979092681785346') {
        // dont let pastrami do anything for Brad
        logger.log(`IGNORE GREET user: ${member.user.username} | channel: ${member.voice.channel.name}`);
        return;
    }

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
    const sevenAndAHalfHours = 27000000; // 6 hours and 90 minutes
    
    let memberEarned69 = false;

    if (sixtyNinersMemberData && isProduction) {
        const timestamp = new Date().getTime();
        const cooldownEndsTimestamp = sixtyNinersMemberData.cooldownEnds;
        const isEligible = timestamp - cooldownEndsTimestamp >= 0;
        if (isEligible && getRandomBetween(1, 69) === 69) {
            // member hit the rare greeting!
            memberEarned69 = true;
            randomMemberGreeting = '*NAME* has earned the right to 69 with me'
                .replaceAll('*NAME*', `${member.nickname || member.user.username || ''}`);
            if (sixtyNinersMemberData.earned > 0) {
                randomMemberGreeting += ` ${sixtyNinersMemberData.earned + 1} times.`;
            }
            sixtyNinersData[memberId] = {
                timestamp,
                cooldownEnds: timestamp + sevenAndAHalfHours,
                earned: sixtyNinersMemberData.earned + 1
            }
            fs.writeFileSync('./data/69ers.json', JSON.stringify(sixtyNinersData, null, 2));

            const owner = await client.users.fetch(BOT_OWNER_ID);
            await owner.send(`${memberId} just hit a 69! new count: ${sixtyNinersMemberData.earned + 1}`);
        } else if (isEligible) {
            // missed
            sixtyNinersData[memberId] = {
                ...sixtyNinersData[memberId],
                cooldownEnds: timestamp + sevenAndAHalfHours
            }
            fs.writeFileSync('./data/69ers.json', JSON.stringify(sixtyNinersData, null, 2));
        }
    } else if (isProduction) {
        sixtyNinersData[memberId] = {
            timestamp: new Date().getTime(),
            earned: 0,
            cooldownEnds: (new Date().getTime()) + sevenAndAHalfHours,
        }
        fs.writeFileSync('./data/69ers.json', JSON.stringify(sixtyNinersData, null, 2));
    }

    logger.log(`GREET user: ${member.user.username} | channel: ${member.voice.channel.name} | ${randomMemberGreeting}`);

    if (randomMemberGreeting.includes('*AUDIOFILE*')) {
        const audioFileName = randomMemberGreeting.split('*AUDIOFILE*')[1];
        connectAndPlayAudioFile(channel, `${AUDIOFILES_DIR_PATH}/${audioFileName}`);
        return;
    }

    const total69s = getTotal69s();
    if (memberEarned69 && total69s % 69 === 0) {
        randomMemberGreeting += ' That\'s a MEGA 69 baby!';
    }
    
    speakText(channel, randomMemberGreeting);
};

const getTotal69s = () => {
    const sixtyNinersData = require('../data/69ers.json');
    const sixtyNinersArray = [...Object.entries(sixtyNinersData)];

    let total = 0;
    for (let i = 0; i < sixtyNinersArray.length; ++i) {
        const [id, {timestamp, cooldownEnds, earned}] = sixtyNinersArray[i];

        total += earned;
    }

    return total;
};