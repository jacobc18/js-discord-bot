const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const {
    AudioPlayerStatus
} =  require('@discordjs/voice');
const Youtube = require('simple-youtube-api');
const MusicPlayer = require('../utils/MusicPlayer');
const createGuildData = require('../utils/createGuildData');
const {
    playLiveStreams,
    maxVideoPlayLengthMinutes,
    maxNumPlaylistsPerUser
} = require('../config/music.json');
const users = require('../data/users.json');
const getTimeString = require('../utils/getTimeString');
const constructSongObj = require('../utils/constructSongObj');
const handleSubscription = require('../utils/handleSubscription');
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
                        .setRequired(true)))
        .addSubcommand(subcommand => 
            subcommand
                .setName('play')
                .setDescription('plays a playlist with given name')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('name of playlist to play/queue')
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
        } else if (subcommandName === 'remove-url') {
            removeTrackFromPlaylist(interaction);
            return;
        } else if (subcommandName === 'list') {
            listPlaylist(interaction);
            return;
        } else if (subcommandName === 'delete') {
            deletePlaylist(interaction);
            return;
        } else if (subcommandName === 'play') {
            playPlaylist(interaction);
            return;
        }
        
        await interaction.reply('invalid /playlist command');
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
    const playlistName = interaction.options.getString('playlist');
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

const removeTrackFromPlaylist = async interaction => {
    const playlistName = interaction.options.getString('playlist');
    const playlistNameLowerCase = playlistName.toLowerCase();
    const index = interaction.options.getInteger('index');
    const userId = interaction.user.id;

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

    if (index && (index <= 0 || index > userPlaylist.length)) {
        await interaction.reply(`\'index\' value of ${index} is out of bounds!`);
        return;
    }

    // update user data
    const removedTrack = userPlaylist.splice(index - 1, 1)[0];
    userData.playlists[playlistNameLowerCase] = userPlaylist;
    users[userId] = userData;
    fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2));

    await interaction.reply(`successfully removed ${removedTrack.title} from index ${index} within playlist ${playlistName}`);
};

const listPlaylist = async interaction => {
    const playlistName = interaction.options.getString('playlist-name');
    const userId = interaction.user.id;

    let userData = users[userId];

    if (!userData || !userData.playlists || (userData.playlists && Object.keys(userData.playlists).length === 0)) {
        await interaction.reply('You don\'t have any playlists! Try using \'/playlist create *name*\' to create one');
        return;
    }

    const userPlaylists = userData.playlists;

    if (!playlistName) {
        // list playlists
        let output = 'Your playlists:\n';
        for (let key in userPlaylists) {
            const playlist = userPlaylists[key];
            output += `${key}\t|\ttrack count: ${playlist.length}\t|\tduration: ${getTotalPlaylistDuration(playlist)}\n`;
        }
        await interaction.reply(output);
        return;
    }

    const userPlaylist = userPlaylists[playlistName.toLowerCase()];

    if (userPlaylist.length === 0) {
        await interaction.reply(`playlist ${playlistName} is empty!`);
        return;
    }

    // list tracks within a playlist
    let output = `Tracks within ${playlistName}:\n`;
    for (let i = 0; i < userPlaylist.length; ++i) {
        const track = userPlaylist[i];
        output += `${track.title}\t|\tduration: ${track.duration}\n`;
    }
    output += `total playlist duration: ${getTotalPlaylistDuration(userPlaylist)}`;
    await interaction.reply(output);
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

const playPlaylist = async interaction => {
    if (!interaction.client.guildData.get(interaction.guildId)) {
        interaction.client.guildData.set(interaction.guildId, createGuildData(interaction.guildId));
    }

    const nameInput = interaction.options.getString('name');
    const nameInputLowerCase = nameInput.toLowerCase();
    const userId = interaction.user.id;
    const channelId = interaction.member.voice.channelId;

    if (!channelId) {
        await interaction.reply('You must first join a voice channel');
        return;
    }

    const userData = users[userId];

    if (!userData || ! userData.playlists || !userData.playlists[nameInputLowerCase]) {
        await interaction.reply(`you have no playlist named ${nameInput}! Try using \'/playlist create *name*\' to create one.\nUse command '/playlist list' to view a list of your playlists`);
        return;
    }

    const userPlaylist = userData.playlists[nameInputLowerCase];

    if (userPlaylist.length === 0) {
        await interaction.reply(`you have no tracks in playlist ${nameInput}! Try using /playlist add-url to add tracks`);
        return;
    }

    let player = interaction.client.musicPlayerManager.get(interaction.guildId);

    if (!player) {
        player = new MusicPlayer();
        interaction.client.musicPlayerManager.set(interaction.guildId, player);
    }

    if (player.commandLock) {
        return await interaction.reply(
            'Please wait until the last play call is processed'
        );
    }

    player.commandLock = true;

    // enqueue each video from the playlist
    for (let i = 0; i < userPlaylist.length; ++i) {
        const track = userPlaylist[i];
        const video = await youtube.getVideoByID(track.id).catch(async function() {
            await interaction.reply(
                `:x: There was a problem getting the video from playlist entitled: ${track.title}`
            );
        });
    
        if (video) {
            player.queue.push(
                constructSongObj(
                    video,
                    interaction.member.voice.channel,
                    interaction.member.user,
                    // timestamp
                )
            );
        }
    }

    if (player.audioPlayer.state.status !== AudioPlayerStatus.Playing) {
        // first video in queue, start playing
        handleSubscription(player.queue, interaction, player);
    } else {
        // video was added to queue
        await interaction.reply(`Enqueued tracks within playlist named ${nameInput}`);
    }
};

const getTotalPlaylistDuration = playlist => {
    let totalSec = 0;
    for (let i = 0; i < playlist.length; ++i) {
        const track = playlist[i];
        const durationString = track.duration;
        const durationSplit = durationString.split(':');
        let multiplier = 3600;
        if (durationSplit.length === 2) {
            multiplier = 60;
        }
        for (let j = 0; j < durationSplit.length; ++j) {
            totalSec += +durationSplit[j] * multiplier;
            multiplier /= 60;
        }
    }
    const hours = Math.floor(totalSec / 3600);
    totalSec -= hours * 3600;
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    return `${hours ? hours + ':' : ''}${minutes < 10 ? '0' + minutes : minutes ? minutes : '00'}:${seconds < 10 ? '0' + seconds : seconds ? seconds : '00'}`;
};

const isYouTubeVideoURL = v =>
  v.match(/^(http(s)?:\/\/)?(m.)?((w){3}.)?(music.)?youtu(be|.be)?(\.com)?\/.+/);