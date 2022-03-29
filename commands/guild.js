const {
  getGuild: apiGetGuild
} = require('../services/pastramiApi');
const { isDiscordId } = require('../utils/regexHelpers');

const logger = require('../utils/logger');

module.exports = {
  data: {
    name: 'guild',
    type: 'text'
  },
  async execute(message, args) {
    let guildId = message.guildId;

    if (args.length > 0) {
      guildId = args[0];
    }

    logger.log(`!GUILD ${args.length > 0 ? args[0] : ''} user: ${message.member.user.username} | guildId: ${message.guildId}`);

    if (!isDiscordId(guildId)) {
      await message.reply(`invalid discord guild id: ${guildId}`);
      return;
    }

    const apiGuild = await apiGetGuild(guildId);
    if (apiGuild.error) {
      await message.channel.send(`Error trying to receive guild data from Pastrami API with discord guild id: ${guildId}, error: ${apiGuild.error}`);
      return;
    }

    const discordGuild = message.guild;

    let outputStr = `\`\`\`Pastrami API guild "${discordGuild.name}" data:\n`;
    outputStr += `discordId: ${apiGuild.discordId}\n`;
    outputStr += `id: ${apiGuild.id}\n`;
    outputStr += `default guild greetings:\n`;
    for (let i = 0; i < apiGuild.greetings.length; ++i) {
      outputStr += `${i + 1}: ${apiGuild.greetings[i]}\n`;
    }

    if (args.length === 0) {
      outputStr += `\nDiscord generic guild "${discordGuild.name}" data:\n`;
      outputStr += `id: ${discordGuild.id}\n`;
      outputStr += `members: ${discordGuild.memberCount}\n`;
      outputStr += `owner id: ${discordGuild.ownerId}\n`;
    }
    outputStr += '```';

    await message.channel.send(`${outputStr}`);
  }
};
