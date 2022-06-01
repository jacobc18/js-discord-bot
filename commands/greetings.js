const logger = require('../utils/logger');
const sendBotOwnerDM = require('../utils/sendBotOwnerDM');
const { isDiscordId } = require('../utils/regexHelpers');
const { tryGetUser } = require('../services/pastramiApi')

module.exports = {
  data: {
    name: 'greetings',
    type: 'text'
  },
  async execute(message, args) {
    const userId = message.author.id;
    const client = message.client;
    const guildId = message.guildId;

    logger.log(`!GREETINGS ${args} user: ${message.member.user.username} | guildId: ${guildId}`);

    if (args.length === 0) {
      await handleDisplayGreetings(message, userId, client);
      return;
    }

    const mainCmd = args[0].toLowerCase();

    if (isDiscordId(mainCmd)) {
      // inputn is user id or user tag
      const inputDiscordId = mainCmd.replace('<@', '').replace('>', '');
      await handleDisplayGreetings(message, inputDiscordId, client);
      return;
    }
    
    switch (mainCmd) {
      case 'get':
      case 'g':
      case 'list':
      case 'l':
      case 'show':
        await handleDisplayGreetings(message, userId, client);
        return;
      case 'help':
      case 'h':
        await handleHelpCmd(message);
        return;
    }

    await message.channel.send('Sorry, I\'m not familiar with that command. Try "!greetings help" for help with the !greetings command');
  }
};

const handleDisplayGreetings = async(message, discordId, client) => {
  const apiUser = await tryGetUser(discordId);

  if (!apiUser) {
    await sendBotOwnerDM(client, `tryGetUser client error for discordId: ${memberId} within !greetings`);

    await message.channel.send('Sorry, but I encountered an error when retrieving the greetings data.');
    return;
  }

  const greetingsObj = apiUser.greetings;

  if (!greetingsObj) {
    await message.channel.send(`User: ${message.author.username} has no greetings currently.`);
    return;
  }

  const maxLineLength = 80;

  const discordUser = client.users.cache.find(u => u.id === discordId);

  let outputStr = `Pastrami Greetings for ${discordUser?.username || `<@${discordId}>`}:\n`;
  outputStr += `\`\`\`Date Match | Greetings\n`;
  const divideLine = `-----------|${'----------'.padEnd(maxLineLength - 12, '-')}\n`;
  outputStr += divideLine;

  for (const dateMatchKey of Object.keys(greetingsObj)) {
    const greetings = greetingsObj[dateMatchKey];
    for (let i = 0; i < greetings.length; ++i) {
      const g = greetings[i];
      let line = i === 0 ? dateMatchKey.padEnd(11) + '| ' : '| '.padStart(13, ' ');
      line += `${g}\n`;
      if (line.length > maxLineLength) {
        const diff = line.length - maxLineLength;
        const substringIdx = line.length - diff;
        outputStr += line.substring(0, substringIdx) + '\n';
        line = '+ '.padStart(13, ' ') + line.substring(substringIdx);
      }
      outputStr += line;
    }
    outputStr += divideLine;
  }
  outputStr += '```';

  await message.channel.send(outputStr);
};

const handleHelpCmd = async(message) => {
  let outputStr = 'Pastrami !greetings help:\n```';
  outputStr += '"!greetings" displays your Pastrami greetings\n';
  outputStr += '"!greetings *id*" displays Pastrami greetings for user with discord id *id*\n';
  outputStr += '"!greetings help" displays this help message ;)\n';
  outputStr += '```';
  await message.channel.send(outputStr);
};
