const logger = require('../utils/logger');

const BOT_OWNER_ID = '189181051216592896';

module.exports = {
  data: {
    name: 'test',
    type: 'text'
  },
  async execute(message) {
    const userId = message.author.id;
    if (userId !== BOT_OWNER_ID) {
      await message.reply('command is not available to you');
      return;
    }

    const client = message.client;
    const guildId = message.guildId;

    logger.log(`!TEST user: ${message.member.user.username} | guildId: ${guildId}`);

    console.log('test code here');

    await message.reply('test cmd executed successfully');
  }
};
