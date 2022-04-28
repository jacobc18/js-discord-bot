require('../utils/getDotenv');

const {
    AudioPlayerStatus
} =  require('@discordjs/voice');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Youtube = require('simple-youtube-api');
const { YouTube: YoutubeSearch } = require('youtube-sr');
const YTS = require('yt-search');
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
const shuffleArray = require('../utils/shuffleArray');
const logger = require('../utils/logger');

const youtube = new Youtube(process.env.YOUTUBE_API_KEY);

const SPOTIFY_PLAYLIST_TYPE = 'playlist';
const SPOTIFY_ALBUM_TYPE = 'album';

const isYouTubeVideoURL = v =>
  v.match(/^(http(s)?:\/\/)?(m.)?((w){3}.)?(music.)?youtu(be|.be)?(\.com)?\/.+/);

const isSpotifyPlaylistURL = v =>
  v.match(/^(spotify:|https:\/\/[a-z]+\.spotify\.com\/playlist\/.+)/);

const isSpotifyAlbumURL = v =>
  v.match(/^(spotify:|https:\/\/[a-z]+\.spotify\.com\/album\/.+)/);

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
            interaction.client.guildData.set(interaction.guildId, await createGuildData(interaction.guildId));
        }

        const channelId = interaction.member.voice.channelId;
        const voiceChannel = interaction.member.voice.channel;

        if (!channelId) {
            await interaction.reply('You must first join a voice channel');
            return;
        }

        let logStringAdditions = '';

        let query = interaction.options.getString('query');
        logger.log(`/YT query: ${query}`);

        await interaction.channel.send(`\`${query}\``);

        const querySplit = query.split(' ');
        const shuffleFlag = querySplit[querySplit.length - 1] === '-s' || querySplit[querySplit.length - 1] === '-shuffle'

        if (shuffleFlag) {
            querySplit.pop();
        }
        query = querySplit.join(' ');

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
            
            if (!splitQuery[2]) {
                interaction.reply(
                    'There was an issue processing your request. (Perhaps invalid/unsupported input)'
                );
                player.commandLock = false;
                return;
            }

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

            const result = await handleYoutubeVideo(interaction, video, player, null);
            if (!result) {
                await interaction.reply(
                    `:x: There was a problem playing video with id ${video.videoId}`
                );
            }

            logStringAdditions += ` | video.title: ${video.title}`;
        } else if (getTypeOfSpotifyURL(query)) {
            const spotifyURLType = getTypeOfSpotifyURL(query);

            let replaceQuery;
            if (spotifyURLType === SPOTIFY_ALBUM_TYPE) {
                replaceQuery = query.replace(/spotify:|https:\/\/[a-z]+\.spotify\.com\/album\//, '')
            } else {
                replaceQuery = query.replace(/spotify:|https:\/\/[a-z]+\.spotify\.com\/playlist\//, '')
            }
            const splitQuery = replaceQuery.split('?');
            const spotifyObjID = splitQuery[0];

            const token = await authenticateSpotify();
            let spotifyData;
            if (spotifyURLType === SPOTIFY_ALBUM_TYPE) {
                spotifyData = await getSpotifyAlbum(token, spotifyObjID);
            } else {
                spotifyData = await getSpotifyPlaylist(token, spotifyObjID);
            }

            if (!spotifyData) {
                await interaction.reply(
                    `:x: There was a problem getting the ${spotifyURLType} via Spotify with id: ${spotifyObjID}`
                );
            }

            await interaction.deferReply();

            let spotifyTracks = spotifyData.tracks.items;
            if (shuffleFlag) {
                spotifyTracks = shuffleArray(spotifyTracks);
            }

            for (let i = 0; i < spotifyTracks.length; ++i) {
                const track = spotifyTracks[i].track ? spotifyTracks[i].track : spotifyTracks[i];
                const trackData = {
                    name: track.name,
                    artists: track.artists
                };
                const ytSearchQuery = concatTrackDetails(trackData);
                const ytSearchResults = await YoutubeSearch.searchOne(ytSearchQuery, 'video');
                if (!ytSearchResults || !ytSearchResults.id) {
                    interaction.channel.send(`:x: There was a problem searching the Spotify video from playlist entitled: ${track.name}`);
                    continue;
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
                await interaction.reply(`Enqueued tracks within Spotify ${spotifyURLType} entitled ${spotifyData.name} from link: ${query}`);
            }
        } else {
            // search for query input
            // TODO: allow for -l (-L) flag to list available videos
            const { videos } = await YTS(query);
            if (!videos || videos.length === 0) {
                await interaction.reply(`Youtube Search returned 0 videos for query: "${query}"`);

                return;
            }

            const topVideo = videos[0];
            topVideo.duration = createRawYTVideoDuration(topVideo.duration);
            const result = handleYoutubeVideo(interaction, topVideo, player, '');
            if (!result) return;
        }

        logger.log(`/YT user: ${interaction.member.user.username} | channel: ${voiceChannel.name} | ${query}${logStringAdditions}`);
    }
};

const handleYoutubeVideo = async(interaction, video, player, timestamp) => {
    if (video.raw && video.raw.snippet.liveBroadcastContent === 'live' && !playLiveStreams) {
        deleteMusicPlayerIfNeeded(interaction);
        await interaction.reply(
            'Live streams are disabled in this server'
        );
        player.commandLock = false;

        return null;
    }

    const durationMinutes = Object.keys(video.duration).includes('days')
        ? (video.duration.days * 1440) + (video.duration.hours * 60) + video.duration.minutes
        : video.duration.seconds / 60;


    if (durationMinutes > maxVideoPlayLengthMinutes) {
        deleteMusicPlayerIfNeeded(interaction);
        await interaction.reply(
            `Videos longer than ${maxVideoPlayLengthMinutes} minutes are disabled`
        );
        player.commandLock = false;

        return null;
    }

    if (player.length > maxQueueLength) {
        await interaction.reply(
            `The queue hit its limit of ${maxQueueLength}, please wait a bit before attempting to play more songs`
        );
        player.commandLock = false;

        return null;
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

    return video;
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

// returns SPOTIFY_PLAYLIST_TYPE for Spotify playlist URL
// OR returns SPOTIFY_ALBUM_TYPE for Spotify album URL
// else returns null;
const getTypeOfSpotifyURL = (query) => {
    if (isSpotifyPlaylistURL(query)) {
        return SPOTIFY_PLAYLIST_TYPE;
    } else if (isSpotifyAlbumURL(query)) {
        return SPOTIFY_ALBUM_TYPE;
    }

    return null;
}

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

const getSpotifyAlbum = async(token, albumId) => {
    try {
        const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
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

const createRawYTVideoDuration = (ytsDuration) => {
    const secsInADay = 86400;
    const secsInAnHour = 3600;
    let ytsSeconds = ytsDuration.seconds;
    const days = Math.floor(ytsSeconds / secsInADay);
    ytsSeconds %= secsInADay;
    const hours = Math.floor(ytsSeconds / secsInAnHour);
    ytsSeconds %= secsInAnHour;
    const minutes = Math.floor(ytsSeconds / 60);
    ytsSeconds %= 60;
    const seconds = ytsSeconds;

    return {
        years: 0, months: 0, weeks: 0,
        days,
        hours,
        minutes,
        seconds
    };
};
