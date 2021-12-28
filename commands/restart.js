const logger = require('../utils/logger');

module.exports = {
    data: {
        name: 'restart',
        type: 'text'
    },
    async execute(message) {
        logger.log(`!RESTART user: ${message.member.user.username} | guildId: ${message.guildId}`);
        await message.reply('restarting myself...');

        throw new Error(`restart initiated by ${message.member.user.username}`)
    }
};