// returns array of admin discord ids
const getAdminIds = () => {
  // jeek
  return ['189181051216592896'];
};

const getIsAdminId = (discordId) => {
  return getAdminIds().includes(discordId);
};

module.exports = {
  getAdminIds,
  getIsAdminId
}
