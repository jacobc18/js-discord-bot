const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../utils/logger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('playlist')
		.setDescription('various playlist commands')
        .addSubcommand(subcommand => 
            subcommand
                .setName('create')
                .setDescription('creates a playlist with given name')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('name of playlist to create')
                        .setRequired(true)))
        .addSubcommand(subcommand => 
            subcommand
                .setName('add')
                .setDescription('add a given url to given playlist')
                .addStringOption(option =>
                    option.setName('playlist')
                        .setDescription('name of playlist to add url to')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('url')
                        .setDescription('url to add')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('index')
                        .setDescription('index to add url at, defaults to end of playlist')))
        .addSubcommand(subcommand => 
            subcommand
                .setName('remove')
                .setDescription('remove a url from given playlist at given index')
                .addStringOption(option =>
                    option.setName('playlist')
                        .setDescription('name of playlist to remove url from')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('index')
                        .setDescription('index of url to remove')
                        .setRequired(true)))
        .addSubcommand(subcommand => 
            subcommand
                .setName('list')
                .setDescription('list all of your playlists, optional parameter playlist-name lists all urls within given playlist')
                .addStringOption(option =>
                    option.setName('playlist-name')
                        .setDescription('name of playlist to list urls within')))
        .addSubcommand(subcommand => 
            subcommand
                .setName('delete')
                .setDescription('delete a playlist with given name')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('name of playlist to delete')
                        .setRequired(true))),
	async execute(interaction) {
        logger.log(`/PLAYLIST user: ${interaction.member.user.username} | channel: ${interaction.member.voice.channel.name}`);
        await interaction.reply('/playlist commands are a work in progress');
	}
};