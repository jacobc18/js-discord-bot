const {
  greetingsAdd,
  greetingsDelete
} = require('./admin/greetings');

const logger = require('../utils/logger');

const BOT_OWNER_ID = '189181051216592896';

module.exports = {
  data: {
    name: 'admin',
    type: 'text'
  },
  async execute(message, args) {
    const userId = message.author.id;

    if (userId !== BOT_OWNER_ID) {
      await message.channel.send(`You do not have admin privileges! Contact <@${BOT_OWNER_ID}> for more information.`);
      return;
    }

    logger.log(`!ADMIN ${args} | user: ${message.author.username}`);

    if (args.length === 0) {
      await handleHelpCmd(message);
      return;
    }

    const mainCmd = args[0].toLowerCase();
    
    switch (mainCmd) {
      case 'greetings':
      case 'g':
        await handleGreetingsCmd(message, args.slice(1));
        return;
      case 'help':
        await handleHelpCmd(message);
        return;
    }

    await handleHelpCmd(message, 'Sorry, I don\'t recognize that command! Here\'s a list of main *!admin* cmds found via *!admin help*:');
  }
};

const handleGreetingsCmd = async(message, args) => {
  if (args.length === 0) {
    await message.channel.send('!admin g help WIP');
    return;
  }

  switch (args[0]) {
    case 'add':
    case 'a':
      await greetingsAdd(message, args.slice(1));
      return;
    case 'delete':
    case 'd':
      await greetingsDelete(message, args.slice(1));
      return;
  }

  await message.channel.send('!admin g help WIP 2');
};

const handleHelpCmd = async(message, additionalMsg) => {
  if (additionalMsg) {
    await message.channel.send(additionalMsg);
  }

  await message.channel.send('!admin WIP');
}
