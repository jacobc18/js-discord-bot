module.exports = async function(client, { interaction, message }, banData) {
  const banMsg = `You've been naughty! I'm not listening to you! (Ban Reason: \`${banData?.reason || ""}\`)`;

  // todo: add reason, timestamp, etc
  if (interaction) {
    await interaction.reply(banMsg);
  } else if (message) {
    await message.channel.send(banMsg);
  }
}