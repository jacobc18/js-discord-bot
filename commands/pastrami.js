const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pastrami')
		.setDescription('get a list of Pastrami\'s commands'),
    aliases: ['help'],
	async execute(interaction) {
        const guildId = interaction.guildId;

        const embed = new MessageEmbed()
            .setColor('#bd84dc')
            .setTitle('Pastrami Commands')
            .setURL('https://github.com/jacobc18/js-discord-bot#readme')
            // .setDescription('Some description here')
            .addFields(
                // { name: '\u200B', value: '\u200B' }, blank field
                { name: '!69ers', value: 'displays 69ers standings and pie chart' },
                { name: '!guild | !server *guildId*', value: 'displays guild info; input is current guild by default' },
                { name: '!cd | !cooldown', value: 'displays your 69er chance cooldown' },
                { name: '!echo *query*', value: 'repeats back given *query*' },
                { name: '!leave', value: 'forces Pastrami to leave a voice channel if in one' },
                { name: '!kanye | !kanyesays', value: 'gives a Kanye West quote' },
                { name: '/baldies', value: 'will post a wiki link to a random famous person who is currently bald or was bald at any point in their adult life' },
                { name: '/listaudio', value: 'lists any audio files that are available to be played by Pastrami'},
                { name: '/playaudio *fileName*', value: 'adds Pastrami to the voice channel and play the audio *filename* specified in the command'},
                { name: '/speak *text*', value: 'adds Pastrami to the voice channel and play a TTS reading of given *text*'},
                { name: '/yt *url*', value: 'adds Pastrami to the voice channel and plays the audio corresponding to the YouTube URL provided (queries WIP)' },
                { name: '!lichess', value: 'lists available !lichess commands' },
                { name: '!playlist *cmd*', value: 'there are multiple playlist slash commands - go ahead and type "/playlist" to check them out' },
                { name: '!report *message*', value: 'Reports *message* (a bug or comment) to the bot owner. Thanks for your help!' },
                { name: '!wordle', value: 'displays info on how to play Wordle with Pastrami' },
                { name: '!help | !pastrami', value: 'displays this command list' }
            )

        logger.log(`/PASTRAMI user: ${interaction.member.user.username} | guildId: ${guildId}`);

		await interaction.reply({
            embeds: [embed]
        });
	}
};