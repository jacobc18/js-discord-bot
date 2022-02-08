const logger = require('../utils/logger');

const sevenAndAHalfHours = 27000000; // 6 hours and 90 minutes

module.exports = {
    data: {
        name: 'cd',
        type: 'text'
    },
    async execute(message) {
        const guildId = message.guildId;
        const userId = message.author.id;

        logger.log(`!CD user: ${message.member.user.username} | guildId: ${guildId}`);

        const sixtyNinersData = require('../data/69ers.json');
        const user69Data = sixtyNinersData[userId];

        if (!user69Data) {
            await message.reply('I don\'t have any 69er data for you. Try joining a voice channel first. ');
            throw new Error(`no 69er data for userId: ${userId}`)
        }

        const todayTimestamp = new Date().getTime();
        const diffInSec = (todayTimestamp - user69Data.cooldownEnds) / 1000;

        if (diffInSec >= 0) {
            await message.reply(`You are currently eligible to earn a 69!`);
            return;
        }

        // gets the time difference in the form HH:MM:SS
        const timeString = new Date(diffInSec * 1000).toISOString().substring(11, 8);

        await message.reply(`You will be eligible for another in ${timeString} (HH:MM:SS)`);
    }
};