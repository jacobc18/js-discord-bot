const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../utils/logger');

const AUDIOFILES_DIR_PATH = './data/audioFiles';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listaudio')
		.setDescription('lists audio files available to be played used the /play command'),
	async execute(interaction) {
		logger.log(`/LISTAUDIO user: ${interaction.member.user.username}`);

		const audioFileNames = fs.readdirSync(AUDIOFILES_DIR_PATH);
		const longestFileLength = getLongestString(audioFileNames);

		const columNames = `Index | File Name\n`;
		const divideLine = `------|-${'-'.repeat(longestFileLength)}\n`;
		let outputStr = `\`\`\`\n${columNames}${divideLine}`;

		for (let i = 0; i < audioFileNames.length; ++i) {
			const fileName = removeFileExtension(audioFileNames[i]);
			outputStr += `${`${i + 1}`.padEnd(6)}| ${fileName.padEnd(longestFileLength)}\n`;
		}
		outputStr += '```';

		await interaction.reply(outputStr);
	}
};

const removeFileExtension = (fileName) => {
	return fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
};

const getLongestString = (strs) => {
	let maxLen = 0;
	for (let i = 0; i < strs.length; ++i) {
		const strLen = removeFileExtension(strs[i]).length;
		maxLen = Math.max(maxLen, strLen);
	}

	return maxLen;
};
