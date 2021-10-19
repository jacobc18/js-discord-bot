require('dotenv').config();

const {
    AudioPlayerStatus
} =  require('@discordjs/voice');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Youtube = require('simple-youtube-api');
const { YouTube: YoutubeSearch } = require('youtube-sr');
const fetch = require('node-fetch');
const MusicPlayer = require('../utils/MusicPlayer');
const createGuildData = require('../utils/createGuildData');
const {
    playLiveStreams,
    maxQueueLength,
    // leaveTimeout,
    // maxResponseTime,
    maxVideoPlayLengthMinutes
} = require('../config/music.json');
const constructSongObj = require('../utils/constructSongObj');
const handleSubscription = require('../utils/handleSubscription');
const deleteMusicPlayerIfNeeded = require('../utils/deleteMusicPlayerIfNeeded');
const logger = require('../utils/logger');

const youtube = new Youtube(process.env.YOUTUBE_API_KEY);

const isYouTubeVideoURL = v =>
  v.match(/^(http(s)?:\/\/)?(m.)?((w){3}.)?(music.)?youtu(be|.be)?(\.com)?\/.+/);

const isSpotifyPlaylistURL = v =>
  v.match(/^(spotify:|https:\/\/[a-z]+\.spotify\.com\/playlist\/.+)/);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yt')
        .setDescription('join the voice channel you\'re in and play youtube url given')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('url')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.client.guildData.get(interaction.guildId)) {
            interaction.client.guildData.set(interaction.guildId, createGuildData(interaction.guildId));
        }

        const channelId = interaction.member.voice.channelId;
        const voiceChannel = interaction.member.voice.channel;

        if (!channelId) {
            await interaction.reply('You must first join a voice channel');
            return;
        }

        let logStringAdditions = '';

        const query = interaction.options.getString('query');

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

        if (isYouTubeVideoURL(query)) {
            let splitQuery = query.replace(/(>|<)/gi, '')
                .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
            const id = splitQuery[2].split(/[^0-9a-z_\-]/i)[0];

            const timestampRegex = /t=([^#&\n\r]+)/g;
            let timestamp = timestampRegex.exec(query);
            if (!timestamp) {
                timestamp = 0;
            } else {
                timestamp = timestamp[1];
                if (timestamp.endsWith('s')) {
                timestamp = timestamp.substring(0, timestamp.indexOf('s'));
                }
                if (!Number(timestamp)) timestamp = 0;
            }
            timestamp = Number(timestamp);

            const video = await youtube.getVideoByID(id).catch(function() {
                deleteMusicPlayerIfNeeded(interaction);
                interaction.reply(
                    ':x: There was a problem getting the video you provided'
                );
            });
            if (!video) return;

            if (video.raw.snippet.liveBroadcastContent === 'live' && !playLiveStreams) {
                deleteMusicPlayerIfNeeded(interaction);
                interaction.reply(
                    'Live streams are disabled in this server'
                );
                return;
            }

            if ((video.duration.days * 1440) + (video.duration.hours * 60) + video.duration.minutes > maxVideoPlayLengthMinutes) {
                deleteMusicPlayerIfNeeded(interaction);
                interaction.reply(
                    `Videos longer than ${maxVideoPlayLengthMinutes} minutes are disabled`
                );
                return;
            }

            if (player.length > maxQueueLength) {
                interaction.reply(
                    `The queue hit its limit of ${maxQueueLength}, please wait a bit before attempting to play more songs`
                );
                return;
            }

            player.queue.push(
                constructSongObj(
                    video,
                    interaction.member.voice.channel,
                    interaction.member.user,
                    timestamp
                )
            );

            if (player.audioPlayer.state.status !== AudioPlayerStatus.Playing) {
                // first video in queue
                handleSubscription(player.queue, interaction, player);
            } else {
                // video was added to queue
                await interaction.reply(`Enqueued ${video.title}`);
            }

            logStringAdditions += ` | video.title: ${video.title}`;
        } else if (isSpotifyPlaylistURL(query)) {
            const playlistQuery = query.replace(/spotify:|https:\/\/[a-z]+\.spotify\.com\/playlist\//, '');
            const splitQuery = playlistQuery.split('?');
            const playlistId = splitQuery[0];

            const token = await authenticateSpotify();
            const playlistData = await getSpotifyPlaylist(token, playlistId);

            const playlistTracks = playlistData.tracks.items;
            for (let i = 0; i < playlistTracks.length; ++i) {
                const track = playlistTracks[i].track;
                const trackData = {
                    name: track.name,
                    artists: track.artists
                };
                const ytSearchQuery = concatTrackDetails(trackData);
                const ytSearchResults = await YoutubeSearch.searchOne(ytSearchQuery, 'video');
                if (!ytSearchResults || !ytSearchResults.id) {
                    await interaction.reply(
                        `:x: There was a problem searching the Spotify video from playlist entitled: ${track.name}`
                    );
                }

                const video = await youtube.getVideoByID(ytSearchResults.id).catch(async function() {
                    await interaction.reply(
                        `:x: There was a problem getting the video from playlist via Youtube entitled: ${track.name}`
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
                await interaction.reply(`Enqueued tracks within Spotify playlist entitled ${playlistData.name} from link: ${query}`);
            }
        } else {
            await interaction.reply('invalid query format');
        }

        logger.log(`/YT user: ${interaction.member.user.username} | channel: ${voiceChannel.name} | ${query}${logStringAdditions}`);
    }
};

// returns spotify authentication token for further spotify api calls
const authenticateSpotify = async() => {
    try {
        const encodedSpotifyCredentials = new Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_SECRET}`).toString('base64');

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                Authorization: 'Basic ' + encodedSpotifyCredentials,
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: 'grant_type=client_credentials'
        });
        const { access_token } = await response.json();

        return access_token;
    } catch (err) {
        logger.log(err);
    }
};

const getSpotifyPlaylist = async(token, playlistId) => {
    try {
        
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = await response.json();

        return data;
    } catch (err) {
        logger.log(err);
    }
};

const concatTrackDetails = ({name, artists = []}) => {
    let artistsStr = '';
    for (let i = 0; i < artists.length; ++i) {
        artistsStr += ` ${artists[i].name}`;
    }
    return `${name}${artistsStr}`;
};
