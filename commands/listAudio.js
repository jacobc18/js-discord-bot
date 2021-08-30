const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../utils/logger');

const AUDIOFILES_DIR_PATH = './data/audioFiles';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listaudio')
		.setDescription('lists audio files available to be played used the /play command'),
	async execute(interaction) {
        const audioFileNames = fs.readdirSync(AUDIOFILES_DIR_PATH);

        logger.log(`/LISTAUDIO user: ${interaction.member.user.username}`);

        await interaction.reply(`Here is a list of files available to be played: ${audioFileNames.join(', ')}`);
	}
};
