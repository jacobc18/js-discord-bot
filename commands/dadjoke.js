const fetch = require('node-fetch');
const logger = require('../utils/logger');
const speakText = require('../utils/speakText');

const DAD_JOKE_API_URL = 'https://icanhazdadjoke.com/';

module.exports = {
  data: {
    name: 'dadjoke',
    type: 'text'
  },
  async execute(message, ...rest) {
    const guildId = message.guildId;
    const textChannel = message.channel;
    const args = rest[0];
    let speakTextFlag = false;

    if (args.length > 0 && args[0].toLowerCase() === '-s') {
      speakTextFlag = true;
    }

    const { joke } = await getDadJokeData();

    logger.log(`!DADJOKE user: ${message.member.user.username} | guildId: ${guildId} | joke: ${joke}`);
    
    await textChannel.send(joke);
    if (speakTextFlag) {
      const voiceChannelId = message.member.voice.channelId;
      const voiceChannel = message.member.guild.channels.cache.get(voiceChannelId);

      await speakText(voiceChannel, joke);
    }
  }
};

const getDadJokeData = async() => {
  try {
    const response = await fetch(DAD_JOKE_API_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    });
    const data = await response.json();

    return data;
  } catch (err) {
    logger.log(err);
  }
};