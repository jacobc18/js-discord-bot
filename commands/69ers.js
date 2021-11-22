const logger = require('../utils/logger');

const quickChartIOHost = 'https://quickchart.io/chart?c=';

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

        // don't use labels
        // const chartLabels = [];
        const chartData = [];
        let total69s = 0;
        let latestDate = new Date(1); // epoch
        let latest69er = '';

        let outputStr = '```Top 69ers:\n';
        outputStr += `${'Name'.padEnd(30)}| Count |${'Time Achieved'.padStart(15)}\n`;
        const divideLine = `------------------------------|-------|---------------\n`;
        outputStr += divideLine;

        for (let i = 0; i < sixtyNinersArray.length; ++i) {
            const [id, {timestamp, earned}] = sixtyNinersArray[i];

            if (earned <= 0) break;

            const user = await message.client.users.fetch(id);
            if (!user) continue;

            const usernameStr = user.username.padEnd(30);
            const earnedStr = `${earned}`.padStart(5);
            total69s += earned;
            const d = new Date(timestamp);
            if (d > latestDate) {
                latestDate = d;
                latest69er =  user.username;
            }
            const timeAchievedStr = getDateTimeStringUTC(d).padStart(15);
            outputStr += `${usernameStr}| ${earnedStr} |${timeAchievedStr}\n`;

            // push chart variables
            // chartLabels.push(user.username.replaceAll(' ', ''));
            chartData.push(`${earned}`);
        }

        outputStr += divideLine;
        outputStr += `${'Total'.padEnd(30)}| ${`${total69s}`.padStart(5)} | Last 69: ${latest69er} -${getDateTimeStringUTC(latestDate).padStart(15)}`;
        outputStr += '```';

        const chart = {
            type: 'pie',
            data: {
                // labels: chartLabels,
                labels: [],
                datasets: [
                    {
                        data: chartData,
                        backgroundColor: ["%230074D9", "%23FF4136", "%232ECC40", "%23FF851B", "%237FDBFF", "%23B10DC9", "%23FFDC00", "%23001f3f", "%2339CCCC", "%2301FF70", "%2385144b", "%23F012BE", "%233D9970", "%23111111", "%23AAAAAA"]
                    }
                ]
            }
        };
        const chartImgURL = `${quickChartIOHost}${JSON.stringify(chart)}`;

        await message.channel.send(`${outputStr}`);
        await message.channel.send(`${chartImgURL}`);
	}
};

const getDateTimeStringUTC = (d = new Date()) => {
    const dateInfoUTC = {
        month: d.getUTCMonth() + 1 < 10 ? '0' + (d.getUTCMonth() + 1) : d.getUTCMonth() + 1,
        date: d.getUTCDate() < 10 ? '0' + d.getUTCDate() : d.getUTCDate(),
        year: `${d.getUTCFullYear()}`.substring(2),
        hours: d.getUTCHours() < 10 ? '0' + d.getUTCHours() : d.getUTCHours(),
        minutes: d.getUTCMinutes() < 10 ? '0' + d.getUTCMinutes() : d.getUTCMinutes()
    };
    return `${dateInfoUTC.month}/${dateInfoUTC.date}/${dateInfoUTC.year} ${dateInfoUTC.hours}:${dateInfoUTC.minutes}`;
};
