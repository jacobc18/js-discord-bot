const { BOT_OWNER_ID } = require('./constants');

module.exports = sendBotOwnerDM = async (client, msg) => {
  const owner = await client.users.fetch(BOT_OWNER_ID);
  await owner.send(msg);
};
