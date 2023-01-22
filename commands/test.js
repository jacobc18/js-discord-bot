const logger = require('../utils/logger');
const { BOT_OWNER_ID } = require('../utils/constants');

module.exports = {
  data: {
    name: 'test',
    type: 'text'
  },
  async execute(message, splitArgs) {
    const userId = message.author.id;
    if (userId !== BOT_OWNER_ID) {
      await message.channel.send('command is not available to you');
      return;
    }

    const client = message.client;
    const guildId = message.guildId;

    logger.log(`!TEST user: ${message.member.user.username} | guildId: ${guildId}`);

    console.log('test code here');

    await message.channel.send('test cmd executed successfully');
  }
};
