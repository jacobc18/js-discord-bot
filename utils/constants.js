require('../utils/getDotenv');
const NODE_ENV = process.env.NODE_ENV;
const isProduction = NODE_ENV.includes('production');


module.exports = {
  // ADMIN
  BOT_OWNER_ID: '189181051216592896', // Jeek
  BOT_DISCORD_ID: isProduction ? '845048733938090025' : '931801280744132648', // Pastrami, PastramiQA

  // CASINO
  DEFAULT_CURRENCY_TICKER: 'KVI',
  COMMISSION_PERCENT: 5,

  // TIME
  DAY_S    : 86400,
  DAY_MS   : 86400000,
  HOUR_S   : 3600,
  HOUR_MS  : 3600000,
  MINUTE_MS: 60000,
  SECOND_MS: 1000,
};
