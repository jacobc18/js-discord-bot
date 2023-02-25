const logger = require('../../utils/logger');
const { BOT_OWNER_ID } = require('../../utils/constants');
const {
  makeAllUserClaims
} = require('../../services/pastramiApi');
const { buildTextGrid } = require('../../utils/textGrid');
const getDateTimeStringLocal = require('../../utils/getDateTimeStringLocal');

module.exports = {
  data: {
    name: 'claim',
    type: 'text'
  },
  async execute(message, splitArgs) {
    const guildId = message.guildId;
    const userId = message.author.id;
    const username = message.member.user.username;

    if (userId !== BOT_OWNER_ID) {
      await message.channel.send('command is not available to you');
      return;
    }

    logger.log(`!CLAIM user: ${username} | guildId: ${guildId}`);

    const userClaimsResults = await makeAllUserClaims(userId);

    if (userClaimsResults.error) {
      await message.channel.send(`An error occurred while gathering your claim(s) data: \`${userClaimsResults.error}\``);
      return;
    }
    
    const flatClaimsResults = userClaimsResults.map(({ allowance, result }) => {
      return { ...allowance, ...result };
    });

    const reasonWidth = 30;
    const columnDefs = [
      {
        title: 'Ticker',
        key: 'ticker',
        width: 10,
        padLeft: 0
      },
      {
        title: 'Amount',
        key: 'amount',
        width: 20
      },
      {
        title: 'Claimed?',
        key: 'success',
        width: 10
      },
      {
        title: 'Reason',
        key: 'reason',
        width: reasonWidth,
        process: (v) => {
          if (!v) return '';
          return v.length >= reasonWidth ? v.substring(26) + '...' : v;
        },
      },
      {
        title: 'Eligible Again',
        key: 'cooldownEnds',
        width: 20,
        process: (v) => {
          if (!Date.parse(v)) return v ?? '';
          return getDateTimeStringLocal(new Date(v));
        }
      }
    ];

    flatClaimsResults.unshift({ divide: true });

    const textGrid = buildTextGrid(columnDefs, flatClaimsResults, 'Claim Results:');

    await message.channel.send(textGrid);
  }
};
