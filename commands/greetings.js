const logger = require('../utils/logger');

module.exports = {
  data: {
    name: 'greetings',
    type: 'text'
  },
  async execute(message) {
    const userId = message.author.id;
    const client = message.client;
    const guildId = message.guildId;

    logger.log(`!GREETINGS user: ${message.member.user.username} | guildId: ${guildId}`);

    // code here

    await message.channel.send('!greetings is currently a work in progress');
  }
};
