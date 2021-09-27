require('dotenv').config();

const {
	joinVoiceChannel,
    entersState,
    VoiceConnectionStatus,
    AudioPlayerStatus
} =  require('@discordjs/voice');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Youtube = require('simple-youtube-api');
const MusicPlayer = require('../utils/MusicPlayer');
const createGuildData = require('../utils/createGuildData');
const {
    playLiveStreams,
    maxQueueLength,
    // leaveTimeout,
    // maxResponseTime,
    maxVideoPlayLengthMinutes
} = require('../config/music.json');
const getTimeString = require('../utils/getTimeString');
const logger = require('../utils/logger');

const youtube = new Youtube(process.env.YOUTUBE_API_KEY);

const isYouTubeVideoURL = v =>
  v.match(/^(http(s)?:\/\/)?(m.)?((w){3}.)?(music.)?youtu(be|.be)?(\.com)?\/.+/);

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
            return await interaction.followUp(
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
                interaction.followUp(
                    ':x: There was a problem getting the video you provided'
                );
            });
            if (!video) return;

            if (video.raw.snippet.liveBroadcastContent === 'live' && !playLiveStreams) {
                deleteMusicPlayerIfNeeded(interaction);
                interaction.followUp(
                    'Live streams are disabled in this server'
                );
                return;
            }

            if ((video.duration.days * 1440) + (video.duration.hours * 60) + video.duration.minutes > maxVideoPlayLengthMinutes) {
                deleteMusicPlayerIfNeeded(interaction);
                interaction.followUp(
                    `Videos longer than ${maxVideoPlayLengthMinutes} minutes are disabled`
                );
                return;
            }

            if (player.length > maxQueueLength) {
                interaction.followUp(
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
        } else {
            await interaction.reply('invalid query format');
        }

        logger.log(`/YT user: ${interaction.member.user.username} | channel: ${voiceChannel.name} | ${query}${logStringAdditions}`);
    }
};

const handleSubscription = async (queue, interaction, player) => {
    let voiceChannel = queue[0].voiceChannel;
    if (!voiceChannel) {
        // happens when loading a saved playlist
        voiceChannel = interaction.member.voice.channel;
    }
    // if (interaction.guild.me.voice.channel !== null) {
    //   if (interaction.guild.me.voice.channel.id !== queue[0].voiceChannel.id) {
    //     queue[0].voiceChannel = interaction.guild.me.voice.channel;
    //   }
    // }
    const title = player.queue[0].title;
    let connection = player.connection;
    if (!connection) {
        connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator
        });
        connection.on('error', console.error);
    }
    player.textChannel = interaction.channel;
    player.passConnection(connection);
  
    try {
        await entersState(player.connection, VoiceConnectionStatus.Ready, 10000);
    } catch (err) {
        deleteMusicPlayerIfNeeded(interaction);
        console.error(err);
        await interaction.followUp({ content: 'Failed to join your channel' });

        return;
    }
    player.process(player.queue);
    await interaction.reply(`Now playing ${title}`);
};

const constructSongObj = (video, voiceChannel, user, timestamp) => {
    let duration = getTimeString(video.duration);
    if (duration === '00:00') duration = 'Live Stream';
    // checks if the user searched for a song using a Spotify URL
    let url =
        video.duration[1] == true
            ? video.url
            : `https://www.youtube.com/watch?v=${video.raw.id}`;
    return {
        url,
        title: video.title,
        rawDuration: video.duration,
        duration,
        timestamp,
        thumbnail: video.thumbnails.high.url,
        voiceChannel,
        memberDisplayName: user.username,
        memberAvatar: user.avatarURL('webp', false, 16)
    };
};

const deleteMusicPlayerIfNeeded = interaction => {
    const player = interaction.client.musicPlayerManager.get(interaction.guildId);
    if (player) {
        if (
            (player.queue.length && !player.nowPlaying) ||
            (!player.queue.length && !player.nowPlaying)
        )
        return;
      return interaction.client.musicPlayerManager.delete(interaction.guildId);
    }
};
