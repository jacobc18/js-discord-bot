const { COMMISSION_PERCENT, DEFAULT_CURRENCY_TICKER, BOT_OWNER_ID, BOT_DISCORD_ID } = require('../../utils/constants');
const {
  getUserPositions, postTransaction
} = require('../../services/pastramiApi');
const getRandomBetween = require('../../utils/getRandomBetween');

const logger = require('../../utils/logger');

const PARENT_CMD = 'casino';

const minChance = 2;
const maxChance = 10000;
const minBet = 100;
const parametersDescription = `numberOfOutcomes (X where chance is 1 in X and ${minChance} <= X <= ${maxChance}), bet amount (min: 100), currency ticker (optional, default: ${DEFAULT_CURRENCY_TICKER})`;

const ultraWinEmoji = ':slot_machine:';
const winEmojis = [':moneybag:', ':confetti_ball:', ':tada:', ':chart_with_upwards_trend:'];
const lossEmojis = [':cry:', ':chart_with_downwards_trend:', ':regional_indicator_l:'];

module.exports = {
  data: {
    parentCommand: PARENT_CMD,
    name: 'chance',
    type: 'text',
    description: ':game_die: Play a game of chance where an X-sided die is rolled and if a 1 is rolled you win! :game_die:\n' +
      'A commission of ' + COMMISSION_PERCENT + '% (rounded up) will be charged on wins.\n' +
      'Params: `' + parametersDescription + '`\n' +
      'Payout: *(X - 1) to 1* where X is `numberOfOutcomes`',
  },
  // aliases: ['c'], // TODO: implement infrastructure for this to work
  async execute(message, splitArgs) {
    const guildId = message.guildId;
    const userId = message.author.id;
    const username = message.member.user.username;

    logger.log(`!${PARENT_CMD} CHANCE user: ${username} | guildId: ${guildId}`);

    if (splitArgs.length > 0 && splitArgs[0].toLowerCase() === 'help') {
      await message.channel.send(this.data.description);
      return;
    }

    const {
      numberOfOutcomes,
      betAmount,
      betTicker,
      error
    } = parseArgs(splitArgs);

    if (error) {
      await message.channel.send(error);
      return;
    }

    // check if user has the bet amount of currency in their bank
    const userPositionResult = await getUserPositions(userId, { betTicker });

    if (userPositionResult.error) {
      await message.channel.send(`An error occurred while gathering your positions data to verify currency balance: \`${userPositionResult.error}\``);
      await message.channel.send(`If you haven't yet set up an account with me, please try using command \`!claim\``);
      return;
    }

    const [{amount, ticker}] = userPositionResult;

    if (amount < betAmount) {
      await message.channel.send(`Sorry but it appears you do not have \`${betAmount}${ticker}\` in your account.\n\`You currently have ${amount}${ticker} available.\``);
      return;
    }

    // play the game of chance!
    const outcome = getRandomBetween(1, numberOfOutcomes);
    const userWon = outcome === 1;

    if (userWon) {
      const totalWinnings = (numberOfOutcomes - 1) * betAmount;
      const commission = Math.ceil(totalWinnings * (COMMISSION_PERCENT / 100));
      const earnedAmount = totalWinnings - commission;

      // complete transaction
      const postTransactionResult = await postTransaction({
        sourceDiscordId: BOT_DISCORD_ID,
        destinationDiscordId: userId,
        ticker,
        amount: earnedAmount,
        comment: `casino chance win: 1 in ${numberOfOutcomes}, bet: ${betAmount}`,
      });

      if (postTransactionResult.error) {
        await message.channel.send(`An error occurred while creating transaction: \`${postTransactionResult.error}\`, contact <@${BOT_OWNER_ID}> for more information.`);
        return;
      }

      const winEmoji = numberOfOutcomes >= 100 ? ultraWinEmoji : getResultEmoji(userWon);

      await message.channel.send(`${winEmoji} You won! After commission, you have gained \`${postTransactionResult.amount}${ticker}\`! Payout: ${numberOfOutcomes - 1} to 1\nNew balance: \`${amount + earnedAmount}${ticker}\``);
      return;
    }

    // user lost

    // complete transaction
    const postTransactionResult = await postTransaction({
      sourceDiscordId: userId,
      destinationDiscordId: BOT_DISCORD_ID,
      ticker,
      amount: betAmount,
      comment: `casino chance loss: 1 in ${numberOfOutcomes}, bet: ${betAmount}`,
    });

    if (postTransactionResult.error) {
      await message.channel.send(`An error occurred while creating transaction: \`${postTransactionResult.error}\`, contact <@${BOT_OWNER_ID}> for more information.`);
      return;
    }

    await message.channel.send(`${getResultEmoji(userWon)} Outcome: ${outcome}. You lost! I have removed \`${betAmount}${ticker}\` from your account.\nNew balance: \`${amount - betAmount}${ticker}\``);
  }
};

const parseArgs = (splitArgs) => {
  if (!splitArgs.length || splitArgs.length < 2) {
    return { error: `Please provide arguments: \`numberOfOutcomes, betAmount, currencyTicker (optional, default: ${DEFAULT_CURRENCY_TICKER})\`` };
  }

  const [numberOfOutcomesInp, betAmountInp, ticker] = splitArgs;

  const parsedNumOutcomes = parseInt(numberOfOutcomesInp);
  if (isNaN(parsedNumOutcomes) || parsedNumOutcomes < minChance || parsedNumOutcomes > maxChance) {
    return { error: `parameter \`numberOfOutcomes\` invalid: must be a number >= ${minChance} and <= ${maxChance}` };
  }

  if (ticker && ticker !== DEFAULT_CURRENCY_TICKER) {
    return { error: `parameter \`currencyTicker\` must be omitted or ${DEFAULT_CURRENCY_TICKER}. I am only accepting bets of currency ${DEFAULT_CURRENCY_TICKER} at this time.` };
  }

  const parsedBet = parseInt(betAmountInp);
  if (isNaN(parsedBet) || parsedBet < minBet) {
    return { error: `parameter \`betAmount\` invalid: must be a number >= ${minBet}.` };
  }

  return {
    numberOfOutcomes: parsedNumOutcomes,
    betAmount: parsedBet,
    betTicker: ticker ?? DEFAULT_CURRENCY_TICKER,
  };
};

const getResultEmoji = (userWon) => {
  const emojis = userWon ? winEmojis : lossEmojis;

  return emojis[getRandomBetween(0, emojis.length - 1)];
};
