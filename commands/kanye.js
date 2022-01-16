const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');
const logger = require('../utils/logger');

const KANYE_QUOTES_API_URL = 'https://api.kanye.rest/';
const KANYE_IMAGE_URL = 'https://raw.githubusercontent.com/jacobc18/js-discord-bot/main/data/media/kanye_face.png';

module.exports = {
  data: {
    name: 'kanye',
    type: 'text'
  },
  async execute(message) {
    const guildId = message.guildId;

    logger.log(`!KANYE user: ${message.member.user.username} | guildId: ${guildId}`);

    const quote = await getKanyeQuote();

    const embed = new MessageEmbed()
      .setColor('#f58b57')
      .setTitle('Kanye Says')
      .setURL('https://www.kanyewest.com/')
      .setDescription(`"${quote}"`)
      .setThumbnail(KANYE_IMAGE_URL);

    await message.reply({
      embeds: [embed]
    });
  }
};

const getKanyeQuote = async() => {
  try {
    const response = await fetch(KANYE_QUOTES_API_URL, {
      method: 'GET'
    });
    const data = await response.json();

    return data?.quote;
  } catch (err) {
    logger.log(err);
  }
};