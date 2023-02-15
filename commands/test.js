const logger = require('../utils/logger');
const { BOT_OWNER_ID } = require('../utils/constants');

module.exports = {
  data: {
    name: 'test',
    type: 'text'
  },
  async execute(message, splitArgs) {
    const client = message.client;
    const guildId = message.guildId;
    const userId = message.author.id;
    const username = message.member.user.username;

    if (userId !== BOT_OWNER_ID) {
      await message.channel.send('command is not available to you');
      return;
    }

    logger.log(`!TEST user: ${username} | guildId: ${guildId}`);

    console.log('test code here');

    await message.channel.send('test cmd executed successfully');
  }
};
