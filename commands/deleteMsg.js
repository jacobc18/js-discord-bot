const { isDiscordId } = require('../utils/regexHelpers');

const logger = require('../utils/logger');

module.exports = {
  data: {
    name: 'deleteMsg',
    type: 'text'
  },
  async execute(interaction) {
    logger.log(`!DELETEMSG user: ${interaction.user.username} | guildId: ${interaction.guildId}`);
  
    const customId = interaction.customId;

    if (!customId) {
      let message = interaction;
      await message.channel.send('`!deleteMsg` cmd not available from this source.');
      return;
    }

    // discordId of user who initiated message delete
    const userId = interaction.user.id;

    const args = customId.split(' ').slice(1);
    if (args.length === 0) {
      logger.log(`!DELETEMSG unexpected error: args length 0`);
      return;
    }

    // discordId of the user who made the message which is to potentially be deleted
    const msgCreatorDiscordId = args[0];

    if (!isDiscordId(msgCreatorDiscordId)) {
      logger.log(`!DELETEMSG unexpected error: arg 0 not a discordId: ${msgCreatorDiscordId}`);
      return;
    }

    if (msgCreatorDiscordId !== userId) {
      await interaction.reply('You do not have permission to delete that message!');
      return;
    }
    
    await interaction.reply('Message deleted.');
    await interaction.message.delete();
  }
};
