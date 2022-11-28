const { isDiscordId } = require('../../utils/regexHelpers');
const { banUser, unbanUser } = require('../../services/pastramiApi');

const banUserByDiscordId = async(message, discordId, reason = '') => {
  if (!isDiscordId(discordId)) {
    await message.channel.send(`invalid user discordId: ${discordId}`);
    return;
  }

  const result = await banUser(discordId, reason);

  if (result.banned) {
    await message.channel.send(`successfully banned user for input: discordId: \`${discordId}\`, reason: \`${reason}\``);
    return;
  }

  await message.channel.send(`failed to banned user for input: discordId: \`${discordId}\`, reason: \`${reason || 'none'}\`\nFail Reason: \`${result.failReason}\``);
};

const unbanUserByDiscordId = async(message, discordId) => {
  if (!isDiscordId(discordId)) {
    await message.channel.send(`invalid user discordId: ${discordId}`);
    return;
  }

  const result = await unbanUser(discordId);

  if (result.unbanned) {
    await message.channel.send(`successfully unbanned user for input: discordId: \`${discordId}\``);
    return;
  }

  await message.channel.send(`failed to unban user for input: discordId: \`${discordId}\`\nFail Reason: \`${result.failReason}\``);
};

module.exports = {
  banUserByDiscordId,
  unbanUserByDiscordId
};
