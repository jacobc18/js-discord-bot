const { AudioPlayerStatus } = require('@discordjs/voice');
const logger = require('../utils/logger');

module.exports = {
    data: {
        name: 'resume',
        type: 'text'
    },
	async execute(message) {
        const guildId = message.guildId;
        const musicPlayer = message.client.musicPlayerManager.get(guildId);
        const voiceChannel = message.member.voice.channel;

        logger.log(`!RESUME user: ${message.member.user.username} | guildId: ${guildId}`);

        if (!voiceChannel) {
            await message.reply('you must first join a voice channel');
            return;
        }

        if (!musicPlayer) {
            await message.reply('there is no current track!');
            return;
        }

        if (musicPlayer.audioPlayer.state.status == AudioPlayerStatus.Playing) {
            await message.reply('the current track is not paused!');
            return;
        }

        if (voiceChannel.id !== message.guild.me.voice.channel.id) {
            await message.reply('You must be in the same voice channel as the bot (me) in order to resume');
        }

        const success = musicPlayer.audioPlayer.unpause();

        if (success) {
            // message.reply(':arrow_forward: Track resumed. Use !pause to pause or !leave to have the bot leave the voice channel');
            // await message.deleteReply();
            return;
        }

        // unsuccessful
        await message.reply('I was unable to unpause this song due to an error');
	}
};