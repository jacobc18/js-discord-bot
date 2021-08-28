const { SlashCommandBuilder } = require('@discordjs/builders');
const connectAndPlayAudioFile = require('../utils/connectAndPlayAudioFile');

const AUDIOFILES_DIR_PATH = './data/audioFiles';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('playaudio')
		.setDescription('join the voice channel you\'re in play audio file name given')
        .addStringOption(option =>
            option.setName('filename')
                .setDescription('file to be played')
                .setRequired(true)),
	async execute(interaction) {
        const channelId = interaction.member.voice.channelId;

        if (!channelId) {
            await interaction.reply('You must first join a voice channel');
        }

        const channel = interaction.guild.channels.cache.get(channelId);

        // const fileName = interaction.options.getString('filename');

        connectAndPlayAudioFile(channel, `${AUDIOFILES_DIR_PATH}/trees_man.mp3`);
        await interaction.reply('success');
        await interaction.deleteReply();
	}
};
