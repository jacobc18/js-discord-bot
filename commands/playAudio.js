const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const connectAndPlayAudioFile = require('../utils/connectAndPlayAudioFile');
const logger = require('../utils/logger');

const AUDIOFILES_DIR_PATH = './data/audioFiles';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('playaudio')
		.setDescription('join the voice channel you\'re in and play audio file name given')
        .addStringOption(option =>
            option.setName('filename')
                .setDescription('file to be played')
                .setRequired(true)),
	async execute(interaction) {
        const channelId = interaction.member.voice.channelId;

        if (!channelId) {
            await interaction.reply('You must first join a voice channel');
            return;
        }

        const audioFileNames = fs.readdirSync(AUDIOFILES_DIR_PATH);
        const fileName = interaction.options?.getString('filename');
        const foundFile = findStringIgnoreCase(fileName, audioFileNames);

        if (!foundFile) {
            await interaction.reply(`Could not find an audio file named: ${fileName}.\nTry using /listaudio to get a list of available audio files.`);
            return;
        }

        const channel = interaction.guild.channels.cache.get(channelId);
        const fullFilePath = `${AUDIOFILES_DIR_PATH}/${foundFile}`;

        logger.log(`/PLAYAUDIO user: ${interaction.member.user.username} | channel: ${interaction.member.voice.channel.name} | ${fullFilePath}`);

        connectAndPlayAudioFile(channel, fullFilePath);
        await interaction.reply(`successfully played audio file: ${fileName}`);
	}
};

const findStringIgnoreCase = (str, strArray) => {
    if (!str) return false;

    for (let i = 0; i < strArray.length; ++i) {
        const s = strArray[i];
        if (s.toLowerCase().includes(str.toLowerCase())) {
            return s;
        }
    }

    return false;
};
