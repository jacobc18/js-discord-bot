const NODE_ENV = process.env.NODE_ENV;
const isProduction = NODE_ENV.includes('production');

const users = require('../data/users.json');
const speakText = require('../utils/speakText');
const getRandomBetween = require('../utils/getRandomBetween');
const connectAndPlayAudioFile = require('../utils/connectAndPlayAudioFile');
const createGuildData = require('../utils/createGuildData');
const sendBotOwnerDM = require('../utils/sendBotOwnerDM');
const {
    getUser69Check: apiGetUser69Check,
    getTotal69s: apiGetTotal69s,
    postNewUser: apiPostNewUser
} = require('../services/pastramiApi')
const logger = require('../utils/logger');

const AUDIOFILES_DIR_PATH = './data/audioFiles';

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
        client.guildData.set(newState.guild.id, await createGuildData(newState.guild.id));
    }

    const guildData = client.guildData.get(newState.guild.id);
    const defaultGreetings = guildData.greetings;

    const memberGreetings = memberData?.greetings || defaultGreetings;

    let randomMemberGreeting =
        memberGreetings[getRandomBetween(0, memberGreetings.length - 1)]
        .replaceAll('*NAME*', `${member.nickname || member.user.username || ''}`);
    
    const channel = client.channels.cache.get(channelId);
    let memberEarned69 = false;

    if (isProduction) {
        let user69Check = await apiGetUser69Check(memberId);
        if (user69Check.error) {
            await sendBotOwnerDM(client, `69 check failed for ${memberId}, err: ${user69Check.error}`);
            // create new user
            const newUserResult = await apiPostNewUser(memberId);
            if (newUserResult.error) {
                await sendBotOwnerDM(client, `new user creation failed for ${memberId}, err: ${newUserResult.error}`);

                throw new Error(newUserResult.error);
            }
            user69Check = await apiGetUser69Check(memberId);
            if (user69Check.error) {
                await sendBotOwnerDM(client, `69 check 2 failed for ${memberId}, err: ${user69Check.error}`);

                throw new Error(user69Check.error);
            }
        }
        if (user69Check.hit) {
            // member hit the rare greeting!
            memberEarned69 = true;
            randomMemberGreeting = '*NAME* has earned the right to 69 with me'
                .replaceAll('*NAME*', `${member.nickname || member.user.username || ''}`);
            if (user69Check.earned > 0) {
                randomMemberGreeting += ` ${user69Check.earned + 1} times.`;
            }
        }
    }

    logger.log(`GREET user: ${member.user.username} | channel: ${member.voice.channel.name} | ${randomMemberGreeting}`);

    if (randomMemberGreeting.includes('*AUDIOFILE*')) {
        const audioFileName = randomMemberGreeting.split('*AUDIOFILE*')[1];
        connectAndPlayAudioFile(channel, `${AUDIOFILES_DIR_PATH}/${audioFileName}`);
        return;
    }

    if (isProduction) {
        const { total69s } = await apiGetTotal69s();
        if (memberEarned69 && total69s % 69 === 0) {
            randomMemberGreeting += ' That\'s a MEGA 69 baby!';
        }
    }
    
    speakText(channel, randomMemberGreeting);
};
