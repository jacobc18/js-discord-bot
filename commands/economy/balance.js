const logger = require('../../utils/logger');
const { BOT_OWNER_ID } = require('../../utils/constants');
const {
  getUserPositions
} = require('../../services/pastramiApi');
const { buildTextGrid } = require('../../utils/textGrid');
const getDateTimeStringLocal = require('../../utils/getDateTimeStringLocal');

module.exports = {
  data: {
    name: 'balance',
    type: 'text'
  },
  aliases: ['balances', 'position', 'positions', 'bank', 'wallet'],
  async execute(message, splitArgs) {
    const guildId = message.guildId;
    const userId = message.author.id;
    const username = message.member.user.username;

    logger.log(`!BALANCE user: ${username} | guildId: ${guildId}`);

    const ticker = splitArgs.length > 0 && splitArgs[0] !== 'all' && splitArgs[0];

    const userPositionsResult = await getUserPositions(userId, { ticker });

    if (userPositionsResult.error) {
      await message.channel.send(`An error occurred while gathering your positions data: \`${userPositionsResult.error}\``);
      return;
    }

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
        title: 'Currency Name',
        key: 'currencyName',
        width: 25
      },
      {
        title: 'Last Updated',
        key: 'last_updated',
        width: 20,
        process: (v) => {
          if (!Date.parse(v)) return v;
          return getDateTimeStringLocal(new Date(v));
        }
      }
    ];

    userPositionsResult.unshift({ divide: true });

    const textGrid = buildTextGrid(columnDefs, userPositionsResult, 'Your Positions:');

    await message.channel.send(textGrid);
  }
};
