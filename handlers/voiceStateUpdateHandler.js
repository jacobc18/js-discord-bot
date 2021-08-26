const greetingsData = require('../data/greetings.json');
const speakText = require('../utils/speakText');
const getRandomBetween = require('../utils/getRandomBetween');

module.exports = function(client, oldState, newState) {
    if (newState.id === process.env.CLIENT_ID) return;
  
    if (oldState.channelId === newState.channelId) return;
  
    const channelId = newState.channelId;
    if (!channelId) return;
  
    const memberId = newState.id;
    const member = newState.guild.members.cache.get(memberId);

    const greetingsObj = greetingsData[memberId] || greetingsData.default;
    const memberGreetings = greetingsObj.greetings;

    const randomMemberGreeting =
        memberGreetings[getRandomBetween(0, memberGreetings.length - 1)]
        .replaceAll('*NAME*', `${member.nickname || member.user.username || ''}`);
    
    const channel = client.channels.cache.get(channelId);
    speakText(channel, randomMemberGreeting);
};