const {
    getUser69Check: apiGetUser69Check
} = require('../services/pastramiApi');

const logger = require('../utils/logger');

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

        const user69Data = await apiGetUser69Check(userId);
        if (user69Data.error) {
            await message.channel.send('I don\'t have any 69er data for you. Try joining a voice channel first. ');
            throw new Error(`no 69er data for userId: ${userId}`)
        }

        const todayTimestamp = new Date().getTime();
        let diffInSec = (todayTimestamp - user69Data.cooldownEnds) / 1000;

        if (diffInSec >= 0) {
            await message.channel.send(`You are currently eligible to earn a 69!`);
            return;
        }

        diffInSec *= -1;
        const hours = Math.floor(diffInSec /  3600);
        diffInSec %= 3600;
        const minutes = Math.floor(diffInSec / 60);
        const seconds = diffInSec % 60;
        const timestring = `${hours ? `${hours}h ` : ''}${minutes ? `${minutes}m ` : ''}${seconds ? `${seconds.toFixed()}s` : ''}`;

        await message.channel.send(`You will be eligible for another 69 in ${timestring}`);
    }
};