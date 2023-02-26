const logger = require('../../utils/logger');
const { BOT_OWNER_ID } = require('../../utils/constants');
const {
  postTransaction
} = require('../../services/pastramiApi');
const { buildTextGrid } = require('../../utils/textGrid');
const { getDiscordIdFromTag } = require('../../utils/regexHelpers');

module.exports = {
  data: {
    name: 'gift',
    type: 'text'
  },
  async execute(message, splitArgs) {
    const guildId = message.guildId;
    const userId = message.author.id;
    const username = message.member.user.username;

    if (userId !== BOT_OWNER_ID) {
      await message.channel.send(`You do not have permission to use this command!`);
      return;
    }

    logger.log(`!GIFT user: ${username} | guildId: ${guildId}`);

    if (!splitArgs.length || splitArgs.length < 4) {
      await message.channel.send(`Please provide arguments: \`sourceDiscordId/tag, destinationDiscordId/tag, ticker, amount, comment (optional)\``);
      return;
    }

    const {
      sourceDiscordId,
      destinationDiscordId,
      ticker,
      amount,
      comment,
    } = parseArgs(splitArgs);

    const postTransactionResult = await postTransaction({
      sourceDiscordId,
      destinationDiscordId,
      ticker,
      amount,
      comment,
    });

    if (postTransactionResult.error) {
      await message.channel.send(`An error occurred while creating gift transaction: \`${postTransactionResult.error}\``);
      return;
    }
    
    const rows = [{
      ticker,
      amount: postTransactionResult.amount,
      success: postTransactionResult.success,
      comment,
    }]

    const commentWidth = 30;
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
        title: 'Gifted?',
        key: 'success',
        width: 10
      },
      {
        title: 'Comment',
        key: 'comment',
        width: commentWidth,
        process: (v) => {
          if (!v) return '';
          return v.length >= commentWidth ? v.substring(26) + '...' : v;
        },
      }
    ];

    rows.unshift({ divide: true });

    const textGrid = buildTextGrid(columnDefs, rows, 'Gift Results:');

    await message.channel.send(textGrid);
  }
};

const parseArgs = (splitArgs) => {
  const [sourceDiscordIdInp, destinationDiscordIdInp, ticker, amountInp, ...commentInp] = splitArgs;

  const sourceDiscordId = getDiscordIdFromTag(sourceDiscordIdInp);
  const destinationDiscordId = getDiscordIdFromTag(destinationDiscordIdInp);
  const amount = parseInt(amountInp);
  const comment = commentInp ? commentInp.join(' ') : '';

  return {
    sourceDiscordId,
    destinationDiscordId,
    ticker,
    amount,
    comment
  };
};
