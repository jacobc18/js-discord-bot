const logger = require('../utils/logger');

module.exports = {
    data: {
        name: 'skip',
        type: 'text'
    },
	async execute(message) {
        const guildId = message.guildId;
        const musicPlayer = message.client.musicPlayerManager.get(guildId);
        const voiceChannel = message.member.voice.channel;

        logger.log(`!SKIP user: ${message.member.user.username} | guildId: ${guildId}`);

        if (!musicPlayer) {
            await message.reply('there is no audio being played right now');
            return;
        }

        if (!voiceChannel) {
            await message.reply('you must first join a voice channel');
            return;
        }

        if (voiceChannel.id !== message.guild.me.voice.channel.id) {
            await message.reply('You must be in the same voice channel as the bot (me) in order to skip');
            return;
        }

        const skippedTrack = musicPlayer.nowPlaying;

        // no next song to skip to
        if (!musicPlayer.queue || musicPlayer.queue.length === 0) {
            musicPlayer.connection.destroy();
            message.client.musicPlayerManager.delete(guildId);

            await message.reply(`skipped track entitled: "${skippedTrack.title}", which ended the queue, and left the voice channel`);
            return;
        }

        musicPlayer.audioPlayer.stop();

        await message.reply(`skipped track entitled: ${skippedTrack.title}`);
	}
};