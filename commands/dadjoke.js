const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');
const logger = require('../utils/logger');

const DAD_JOKE_API_URL = 'https://icanhazdadjoke.com/';

module.exports = {
  data: {
    name: 'dadjoke',
    type: 'text'
  },
  async execute(message) {
    const guildId = message.guildId;

    logger.log(`!DADJOKE user: ${message.member.user.username} | guildId: ${guildId}`);

    const dadJokeData = await getDadJokeData();

    await message.reply(dadJokeData.joke);
  }
};

const getDadJokeData = async() => {
  try {
    const response = await fetch(DAD_JOKE_API_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    });
    const data = await response.json();

    return data;
  } catch (err) {
    logger.log(err);
  }
};