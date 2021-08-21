const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('baldies')
		.setDescription('gert is bald!'),
	async execute(interaction) {
		await interaction.reply('GERT "BALD FA LIFE" KEIFROBE');
	},
};