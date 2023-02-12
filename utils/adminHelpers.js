// returns array of admin discord ids
const getAdminIds = () => {
  // jeek, steve
  return ['189181051216592896', '190098635969658881'];
};

const getIsAdminId = (discordId) => {
  return getAdminIds().includes(discordId);
};

module.exports = {
  getAdminIds,
  getIsAdminId
}
