const isDiscordId = (id) => {
  return /[0-9]{10,20}/.test(id);
};

module.exports = {
  isDiscordId
}
