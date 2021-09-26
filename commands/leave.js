const speakText = require('../utils/speakText');
const logger = require('../utils/logger');

module.exports = {
    data: {
        name: 'leave',
        type: 'text'
    },
	async execute(message) {
        const guildId = message.guildId;
        const audioPlayer = message.client.musicPlayerManager.get(guildId);
        if (!audioPlayer) {
            await message.reply('there is no audio being played right now');
        }

        audioPlayer.connection.destroy();
        message.client.musicPlayerManager.delete(guildId);

        logger.log(`!LEAVE user: ${message.member.user.username} | guildId: ${guildId}`);

        await message.reply('left the voice channel');
	}
};