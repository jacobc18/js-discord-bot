const logger = require('../utils/logger');

module.exports = {
    data: {
        name: '69ers',
        type: 'text'
    },
	async execute(message) {
        const guildId = message.guildId;

        logger.log(`!69ERS user: ${message.member.user.username} | guildId: ${guildId}`);

        const sixtyNinersData = require('../data/69ers.json');
        const sixtyNinersArray = [...Object.entries(sixtyNinersData)];
        sixtyNinersArray.sort((a, b) => {
            const aEarned = a[1].earned;
            const bEarned = b[1].earned;

            if (aEarned === bEarned) {
                return a[1].timestamp - b[1].timestamp;
            }

            return bEarned - aEarned;
        });

        let outputStr = '```Top 69ers:\n';
        outputStr += `${'Name'.padEnd(30)}| Count |${'Time Achieved'.padStart(15)}\n`;
        outputStr += `------------------------------|-------|---------------\n`;

        for (let i = 0; i < sixtyNinersArray.length; ++i) {
            const [id, {timestamp, earned}] = sixtyNinersArray[i];

            if (earned <= 0) break;

            const user = await message.client.users.fetch(id);
            if (!user) continue;

            const usernameStr = user.username.padEnd(30);
            const earnedStr = `${earned}`.padStart(5);
            const d = new Date(timestamp);
            const dateInfoUTC = {
                month: d.getUTCMonth() + 1 < 10 ? '0' + (d.getUTCMonth() + 1) : d.getUTCMonth() + 1,
                date: d.getUTCDate() < 10 ? '0' + d.getUTCDate() : d.getUTCDate(),
                year: `${d.getUTCFullYear()}`.substring(2),
                hours: d.getUTCHours() < 10 ? '0' + d.getUTCHours() : d.getUTCHours(),
                minutes: d.getUTCMinutes() < 10 ? '0' + d.getUTCMinutes() : d.getUTCMinutes()
            };
            const timeAchievedStr = `${dateInfoUTC.month}/${dateInfoUTC.date}/${dateInfoUTC.year} ${dateInfoUTC.hours}:${dateInfoUTC.minutes}`.padStart(15);
            outputStr += `${usernameStr}| ${earnedStr} |${timeAchievedStr}\n`;
        }

        outputStr += '```';
        await message.reply(`${outputStr}`);
	}
};