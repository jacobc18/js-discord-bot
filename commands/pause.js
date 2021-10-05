const { AudioPlayerStatus } = require('@discordjs/voice');
const logger = require('../utils/logger');

module.exports = {
    data: {
        name: 'pause',
        type: 'text'
    },
	async execute(message) {
        const guildId = message.guildId;
        const musicPlayer = message.client.musicPlayerManager.get(guildId);
        const voiceChannel = message.member.voice.channel;

        logger.log(`!PAUSE user: ${message.member.user.username} | guildId: ${guildId}`);

        if (!musicPlayer) {
            await message.reply('there is no audio being played right now');
            return;
        }

        if (!voiceChannel) {
            await message.reply('you must first join a voice channel');
            return;
        }

        if (musicPlayer.audioPlayer.state.status == AudioPlayerStatus.Paused) {
            await message.reply('the current track is already paused!');
            return;
        }

        if (voiceChannel.id !== message.guild.me.voice.channel.id) {
            await message.reply('You must be in the same voice channel as the bot (me) in order to pause');
        }

        const success = musicPlayer.audioPlayer.pause();

        if (success) {
            // message.reply(':pause_button: Track was paused. Use !resume to unpause');
            // await message.deleteReply();
            return;
        }

        // unsuccessful
        await message.reply('I was unable to pause this song due to an error');
	}
};