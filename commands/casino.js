const logger = require('../utils/logger');

module.exports = {
  data: {
    name: 'casino',
    type: 'text'
  },
  // aliases: ['c'], // TODO: implement infrastructure for this to work.
  async execute(message, splitArgs) {
    const userId = message.author.id;

    logger.log(`!CASINO ${splitArgs} | user: ${message.author.username}`);

    const helpMsg = ':moneybag: The Pastrami casino is under construction! :moneybag:\n' +
      'Current available `!casino` commands:\n' +
      '`!casino chance *numberOfOutcomes* *betAmount*`\n' +
      '\n' +
      'Try any `!casino` command with parameter \'help\' for more game specific info! (Example: `!casino chance help`)\n' +
      'And remember to claim your daily allowance(s) using command `!claim`!';

    if (splitArgs.length === 0) {
      await message.channel.send(helpMsg);
      return;
    }

    await message.channel.send(helpMsg);
  }
};