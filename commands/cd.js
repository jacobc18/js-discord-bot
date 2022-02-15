const logger = require('../utils/logger');

const sevenAndAHalfHours = 27000000; // 6 hours and 90 minutes

module.exports = {
    data: {
        name: 'cd',
        type: 'text'
    },
    aliases: ['cooldown'],
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
        let diffInSec = (todayTimestamp - user69Data.cooldownEnds) / 1000;

        if (diffInSec >= 0) {
            await message.reply(`You are currently eligible to earn a 69!`);
            return;
        }

        diffInSec *= -1;
        const hours = Math.floor(diffInSec /  3600);
        diffInSec %= 3600;
        const minutes = Math.floor(diffInSec / 60);
        const seconds = diffInSec % 60;
        const timestring = `${hours ? `${hours}h ` : ''}${minutes ? `${minutes}m ` : ''}${seconds ? `${seconds.toFixed()}s` : ''}`;

        await message.reply(`You will be eligible for another 69 in ${timestring}`);
    }
};