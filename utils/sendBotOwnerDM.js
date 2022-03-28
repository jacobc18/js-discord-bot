module.exports = sendBotOwnerDM = async (client, msg) => {
  const BOT_OWNER_ID = '189181051216592896';

  const owner = await client.users.fetch(BOT_OWNER_ID);
  await owner.send(msg);
};
