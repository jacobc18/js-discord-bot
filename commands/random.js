const getRandomBetween = require('../utils/getRandomBetween');
const logger = require('../utils/logger');

module.exports = {
  data: {
    name: 'random',
    type: 'text'
  },
  aliases: ['roll'],
  async execute(message, ...rest) {
    const guildId = message.guildId;

    logger.log(`!RANDOM user: ${message.member.user.username} | guildId: ${guildId}`);

    const args = rest[0] || [];
    if (args.length === 0) {
      await message.channel.send('Please provide arguments separated by spaces like so: `!random arg1 arg2 arg3 etc` or a single argument of a number: `!random 7`');

      return;
    } else if (args.length === 1) {
      const parsedVal = parseInt(args[0]);
      if (!isNaN(parsedVal)) {
        const randomVal = getRandomBetween(0, parsedVal - 1);
        await message.channel.send(`I've randomly chosen: ${randomVal + 1} (from 1 to ${parsedVal})`);

        return;
      }
    }

    const randomIdx = getRandomBetween(0, args.length - 1);

    await message.channel.send(`I've randomly chosen: ${args[randomIdx]}`);
  }
};