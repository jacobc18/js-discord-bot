const logger = require('../utils/logger');

module.exports = {
  data: {
    name: 'play',
    type: 'text'
  },
  async execute(message) {
    const guildId = message.guildId;

    logger.log(`!PLAY user: ${message.member.user.username} | guildId: ${guildId}`);

    await message.channel.send('!play is not a valid command. Did you mean `/yt`?');
  }
};
