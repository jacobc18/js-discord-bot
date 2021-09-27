const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Youtube = require('simple-youtube-api');
const {
    playLiveStreams,
    maxVideoPlayLengthMinutes,
    maxNumPlaylistsPerUser
} = require('../config/music.json');
const users = require('../data/users.json');
const getTimeString = require('../utils/getTimeString');
const logger = require('../utils/logger');

const youtube = new Youtube(process.env.YOUTUBE_API_KEY);

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
        } else if (subcommandName === 'add-url') {
            addTrackToPlaylist(interaction);
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
    } else if (userData.playlists.length >= maxNumPlaylistsPerUser) {
        // user has the max number of playlists allowed in config
        await interaction.reply(`You cannot have more than ${maxNumPlaylistsPerUser} playlists`);
        return;
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

const addTrackToPlaylist = async interaction => {
    const playlistName = interaction.options.getString('playlist').toLowerCase();
    const playlistNameLowerCase = playlistName.toLowerCase();
    const url = interaction.options.getString('url');
    let index = interaction.options.getInteger('index');
    const userId = interaction.user.id;
    let replyStringAdditions = '';

    if (!isYouTubeVideoURL(url)) {
        await interaction.reply('that url is not a valid Youtube video url');
        return;
    }

    let userData = users[userId];

    if (!userData || !userData.playlists) {
        await interaction.reply('You don\'t have any playlists! Try using \'/playlist create *name*\' to create one');
        return;
    }

    const userPlaylist = userData.playlists[playlistNameLowerCase];

    if (!userPlaylist) {
        await interaction.reply(`You have no playlist named ${playlistName}`);
        return;
    }

    let splitQuery = url.replace(/(>|<)/gi, '')
                .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    const videoId = splitQuery[2].split(/[^0-9a-z_\-]/i)[0];

    const video = await youtube.getVideoByID(videoId).catch(async function() {
        await interaction.reply(
            ':x: There was a problem getting the video you provided'
        );
    });

    if (!video) return;

    if (video.raw.snippet.liveBroadcastContent === 'live' && !playLiveStreams) {
        await interaction.reply(
            'Live streams cannot be added to a playlist'
        );
        return;
    }

    if ((video.duration.days * 1440) + (video.duration.hours * 60) + video.duration.minutes > maxVideoPlayLengthMinutes) {
        await interaction.reply(
            `Videos longer than ${maxVideoPlayLengthMinutes} cannot be added to a playlist`
        );
        return;
    }

    if (index && (index <= 0 || index > userPlaylist.length + 1)) {
        await interaction.reply(`optional parameter \'index\' value of ${index} is out of bounds!`);
        return;
    }

    const trackObj = {
        id: videoId,
        title: video.title,
        duration: getTimeString(video.duration)
    };

    if (!index || index === userPlaylist.length + 1) {
        userPlaylist.push(trackObj);
    } else {
        replyStringAdditions += ` at index ${index}`;
        userPlaylist.splice(index - 1, 0, trackObj);
    }

    // update user data
    userData.playlists[playlistNameLowerCase] = userPlaylist;
    users[userId] = userData;
    fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2));

    await interaction.reply(`${video.title} successfully added to playlist ${playlistName}${replyStringAdditions}`);
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
};

const isYouTubeVideoURL = v =>
  v.match(/^(http(s)?:\/\/)?(m.)?((w){3}.)?(music.)?youtu(be|.be)?(\.com)?\/.+/);