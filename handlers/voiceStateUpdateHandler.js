const NODE_ENV = process.env.NODE_ENV;
const isProduction = NODE_ENV.includes('production');

const speakText = require('../utils/speakText');
const getRandomBetween = require('../utils/getRandomBetween');
const connectAndPlayAudioFile = require('../utils/connectAndPlayAudioFile');
const createGuildData = require('../utils/createGuildData');
const sendBotOwnerDM = require('../utils/sendBotOwnerDM');
const {
    tryGetUser: apiTryGetUser,
    getUser69Check: apiGetUser69Check,
    getTotal69s: apiGetTotal69s,
    postNewUser: apiPostNewUser,
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

    const afkChannelId = newState.guild.afkChannelId;
    if (afkChannelId && channelId === afkChannelId) {
        // ignore greetings in afk channels
        logger.log(`IGNORE GREET AFK user: ${member.user.username} | channel: ${member.voice.channel.name}`);
        return;
    }

    if (memberId === '148979092681785346') {
        // dont let pastrami do anything for Brad
        logger.log(`IGNORE GREET user: ${member.user.username} | channel: ${member.voice.channel.name}`);
        return;
    }

    if (member.user.bot) return;

    // don't greet someone if the musicPlayer is playing
    let player = client.musicPlayerManager.get(newState.guild.id);

    if (player && player.nowPlaying) return;

    const channel = member.voice.channel;
    
    const memberData = await apiTryGetUser(memberId);
    if (!memberData) {
        await sendBotOwnerDM(client, `tryGetUser client error for discordId: ${memberId}`);
        let tempGreeting = 'welcome *NAME*'
                .replaceAll('*NAME*', `${member.nickname || member.user.username || ''}`);

        await speakText(channel, tempGreeting);
        return;
    }

    if (memberData.error) {
        await sendBotOwnerDM(client, `tryGetUser api error for discordId: ${memberId}, err: ${memberData.error}`);
    }

    if (!client.guildData.get(newState.guild.id)) {
        client.guildData.set(newState.guild.id, await createGuildData(newState.guild.id));
    }

    const guildData = client.guildData.get(newState.guild.id);
    const defaultGreetings = guildData.greetings;

    const memberGreetings = memberData?.greetings || {'*' : defaultGreetings};

    const matchedGreetings = getMostSpecificMatchedGreetings(memberGreetings);
    let randomMemberGreeting =
        matchedGreetings[getRandomBetween(0, matchedGreetings.length - 1)]
        .replaceAll('*NAME*', `${member.nickname || member.user.username || ''}`);
    
    let memberEarned69 = false;

    const today = new Date();

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
                randomMemberGreeting += ` ${user69Check.earned} times.`;
            }
        } else if (today.getMonth() === 3 && today.getDate() === 1) {
            // april fools 69
            randomMemberGreeting = '*NAME* has earned the right to 69 with me. April fools!'
                .replaceAll('*NAME*', `${member.nickname || member.user.username || ''}`);
        } else if (today.getMonth() === 3 && today.getDate() === 20 && getRandomBetween(1, 5) === 5) {
            // 420
            randomMemberGreeting = '*NAME* has earned the right to blaze it up with me.'
                .replaceAll('*NAME*', `${member.nickname || member.user.username || ''}`);
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
    
    await speakText(channel, randomMemberGreeting);
};

// greetings keys are in the form mm/dd/yyyy where '*' matches any value
// - examples: *, 5/1/1996, 4/1/*, */1/*, 11/*/*
const getMostSpecificMatchedGreetings = (greetingsObj) => {
    const keys = Object.keys(greetingsObj);

    if (keys.length === 1) return greetingsObj[keys[0]];

    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1; // months start at 0
    const d = today.getDate();

    let matches = ['*'];
    for(let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        if (key === '*') continue;

        const splitKey = key.split('/');
        if (splitKey.length !== 3) {
            // unsupported key
            continue;
        }

        const keyY = getParsedSplitVal(splitKey[2], y);
        const keyM = getParsedSplitVal(splitKey[0], m);
        const keyD = getParsedSplitVal(splitKey[1], d);

        // found a match
        if (getMatchKey(d, m, y) === getMatchKey(keyD, keyM, keyY)) {
            matches.push(key);
        }
    }

    const mostSpecificMatches = getMostSpecificMatches(matches);

    let results = [];
    for (let m of mostSpecificMatches) {
        results.push(...greetingsObj[m]);
    }

    return results;
};

// finds matched keys with least number of *'s
// - returns multiple keys in the case of ties
const getMostSpecificMatches = (matches) => {
    if (matches.length === 1) return matches;

    const countSet = {};

    for (let matchKey of matches) {
        if (matchKey === '*') continue;

        const countWildChars = matchKey.split('*').length - 1;
        if (!countSet[countWildChars]) {
            countSet[countWildChars] = [matchKey];
        } else {
            countSet[countWildChars].push(matchKey);
        }
    }

    const lowestCount = Math.min(...Object.keys(countSet));

    return countSet[lowestCount];
}

const getParsedSplitVal = (splitVal, defaultVal) => {
    return splitVal === '*' ? defaultVal : parseInt(splitVal);
};

const getMatchKey = (d, m, y) => {
    return `${m}/${d}/${y}`;
};
