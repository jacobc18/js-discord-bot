const { SlashCommandBuilder } = require('@discordjs/builders');
const speakText = require('../utils/speakText');
const logger = require('../utils/logger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('speak')
		.setDescription('join the voice channel you\'re in and speaks the given text')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('the text to be spoken')
                .setRequired(true)),
	async execute(interaction) {
        const channelId = interaction.member.voice.channelId;

        if (!channelId) {
            await interaction.reply('You must first join a voice channel');
        }

        const channel = interaction.guild.channels.cache.get(channelId);

        const userText = interaction.options.getString('text');

        logger.log(`/SPEAK user: ${interaction.member.user.username} | channel: ${interaction.member.voice.channel.name} | ${userText}`);
        
        speakText(channel, userText);
        await interaction.reply('success');
        await interaction.deleteReply();
	}
};