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
            await message.channel.send('you must first join a voice channel');
            return;
        }

        if (!musicPlayer) {
            await message.channel.send('there is no current track!');
            return;
        }

        if (musicPlayer.audioPlayer.state.status == AudioPlayerStatus.Playing) {
            await message.channel.send('the current track is not paused!');
            return;
        }

        if (voiceChannel.id !== message.guild.me.voice.channel.id) {
            await message.channel.send('You must be in the same voice channel as the bot (me) in order to resume');
        }

        const success = musicPlayer.audioPlayer.unpause();

        if (success) {
            // message.channel.send(':arrow_forward: Track resumed. Use !pause to pause or !leave to have the bot leave the voice channel');
            try {
                // discordjs complains message.delete() is not a function.... but it works? so we ignore the error
                await message.delete();
            } catch (e) { 
                // do nothing
            }
            return;
        }

        // unsuccessful
        await message.channel.send('I was unable to unpause this song due to an error');
	}
};