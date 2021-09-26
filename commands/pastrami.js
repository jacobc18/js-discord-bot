const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pastrami')
		.setDescription('get a list of Pastrami\'s commands'),
	async execute(interaction) {
        const guildId = interaction.guildId;

        const embed = new MessageEmbed()
            .setColor('#bd84dc')
            .setTitle('Pastrami Commands')
            .setURL('https://github.com/jacobc18/js-discord-bot#readme')
            // .setDescription('Some description here')
            .addFields(
                // { name: '\u200B', value: '\u200B' }, blank field
                { name: '!echo', value: 'repeats back given query' },
                { name: '!leave', value: 'forces Pastrami to leave a voice channel if in one' },
                { name: '/baldies', value: 'will post a wiki link to a random famous person who is currently bald or was bald at any point in their adult life' },
                { name: '/listaudio', value: 'lists any audio files that are available to be played by Pastrami'},
                { name: '/playaudio', value: 'adds Pastrami to the voice channel and play the audio file specified in the command'},
                { name: '/speak', value: 'lists any audio files that are available to be played by Pastrami'},
                { name: '/speak', value: 'adds Pastrami to the voice channel and play a TTS reading of given text'},
                { name: '/yt', value: 'adds Pastrami to the voice channel and plays the audio corresponding to the YouTube link provided' }
            )

        logger.log(`/PASTRAMI user: ${interaction.member.user.username} | guildId: ${guildId}`);

		await interaction.reply({
            embeds: [embed]
        });
	}
};