const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

const logger = require('../utils/logger');

const LICHESS_LOGO_URL = 'https://raw.githubusercontent.com/jacobc18/js-discord-bot/main/data/media/lichesslogo.png';

module.exports = {
  data: {
    name: 'lichess',
    type: 'text'
  },
  aliases: ['chess'],
  async execute(message, args) {
    const guildId = message.guildId;

    logger.log(`!LICHESS ${args.toString()} user: ${message.member.user.username} | guildId: ${guildId}`);

    if (args.length === 0) {
      // lichess help cmd
      const embed = new MessageEmbed()
      .setColor('#ffe500')
      .setTitle('!lichess commands')
      .setURL('https://github.com/jacobc18/js-discord-bot#readme')
      .addFields(
          { name: '!lichess', value: 'displays this menu' },
          { name: '!lichess *username*', value: 'displays rating for given user' }
      )

      await message.reply({
        embeds: [embed]
      });
      return;
    } else if (args.length === 1) {
      // assume profile cmd
      const username = args[0];
      const userData = await getLichessPublicUserInfo(username);

      if (!userData) {
        await message.reply(`unable to find user ${username} via Lichess API`);
        return;
      }

      const ratings = userData['perfs'];
      const playTime = userData['playTime'];
      const normalModes = ['bullet', 'blitz', 'rapid', 'classical'];

      const embed = new MessageEmbed()
        .setColor('#ffe500')
        .setTitle(`${username}`)
        .setURL(`${userData.url}`)
        .setThumbnail(LICHESS_LOGO_URL);

      for (let mode of normalModes) {
        const ratingObj = ratings[mode];
        addRatingEmbedField(embed, mode, ratingObj);
      }

      for (let mode of Object.keys(ratings)) {
        if (!normalModes.includes(mode)) {
          const ratingObj = ratings[mode];
          addRatingEmbedField(embed, mode, ratingObj);
        }
      }

      addPlayTimesToEmbed(embed, playTime);

      await message.reply({
        embeds: [embed]
      });
      return;
    }

    await message.reply('Unkown !lichess command. Try !lichess *username*');
  }
};

const getLichessPublicUserInfo = async(username) => {
  try {
    const response = await fetch(`https://lichess.org/api/user/${username}`, {
      method: 'GET'
    });
    const data = await response.json();

    return data;
  } catch (err) {
    logger.log(err);
  }
};

const addRatingEmbedField = (embed, mode, ratingObj) => {
  const isProvisional = ratingObj.prov;
  if (ratingObj.games > 0) {
    let ratingStr = isProvisional ? `${ratingObj.rating}` : `**${ratingObj.rating}**`;
    if (isProvisional) {
      ratingStr += '?';
    }
    if (ratingObj.prog !== 0) {
      ratingStr += (ratingObj.prog > 0 ? '+' : '') + `${ratingObj.prog}`;
    }
    ratingStr += ` (${ratingObj.games} games)`;
    embed.addField(`${capitalizeFirstLetter(mode)}`, ratingStr, true);
  }
};

const addPlayTimesToEmbed = (embed, playTime) => {
  const playTimeFields = ['total', 'tv'];
  for (let field of playTimeFields) {
    const playTimeVal = playTime[field];
    if (playTimeVal) {
      embed.addField(`${capitalizeFirstLetter(field)} Time Played`, `${playTimeVal}s`, true);
    }
  }
};

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}