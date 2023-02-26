const isDiscordId = (id) => {
  return /[0-9]{10,20}/.test(id);
};

const getDiscordIdFromTag = (discordTag) => {
  return discordTag.replace('<@', '').replace('>', '');
};

module.exports = {
  isDiscordId,
  getDiscordIdFromTag,
}
