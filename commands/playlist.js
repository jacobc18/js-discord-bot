const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const users = require('../data/users.json');
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
                .setName('add-url')
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
                .setName('remove-url')
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
        const subcommandName = interaction.options.getSubcommand();

        logger.log(`/PLAYLIST ${subcommandName.toUpperCase()} user: ${interaction.member.user.username} | guild: ${interaction.guildId}`);

        if (subcommandName === 'create') {
            createPlaylist(interaction);
            return;
        } else if (subcommandName === 'delete') {
            deletePlaylist(interaction);
            return;
        }
        
        await interaction.reply('/playlist commands are a work in progress');
	}
};

const createPlaylist = async interaction => {
    const nameInput = interaction.options.getString('name');
    const nameInputLowerCase = nameInput.toLowerCase();
    const userId = interaction.user.id;

    let userData = users[userId];

    if (!userData) {
        // user has no data whatsoever
        userData = {
            playlists: {
                [nameInputLowerCase]: []
            }
        };
    } else if (!userData.playlists) {
        // user has data but no playlists
        userData = {
            ...userData,
            playlists: {
                [nameInputLowerCase]: []
            }
        };
    } else if (userData.playlists[nameInputLowerCase]) {
        // user already has a playlist with this name
        await interaction.reply(`you already have a playlist with name ${nameInput}!`);
        return;
    } else {
        // user already has playlists, add this new one
        userData.playlists[nameInputLowerCase] = [];
    }

    // update user data
    users[userId] = userData;
    fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2));

    await interaction.reply(`successfully created playlist named ${nameInput}`);
};

const deletePlaylist = async interaction => {
    const nameInput = interaction.options.getString('name');
    const nameInputLowerCase = nameInput.toLowerCase();
    const userId = interaction.user.id;

    let userData = users[userId];

    if (!userData || !userData.playlists || !userData.playlists[nameInputLowerCase]) {
        await interaction.reply(`you have no playlist named ${nameInput} to delete! Use command '/playlist list' to view a list of your playlists`);
        return;
    }

    // update user data
    delete userData.playlists[nameInputLowerCase];
    users[userId] = userData;
    fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2));

    await interaction.reply(`successfully deleted playlist named ${nameInput}`);
}