require('../utils/getDotenv');
const fetch = require('node-fetch');
const getRandomBetween = require('../utils/getRandomBetween');
const logger = require('../utils/logger');

module.exports = {
    data: {
        name: 'combo',
        type: 'text'
    },
    async execute(message) {
        const imageList = [];
        const fetchParams = {
            method: "get",
            headers: {
                Authorization: "Client-ID " + process.env.IMGUR_CLIENT_ID
            }
        };
        // imgur gallery hash is static for now, can be dynamic in the future
        await fetch('https://api.imgur.com/3/gallery/zh0IJgo', fetchParams).then(response => response.json())
            .then(json => {
                for (let i = 0; i < json.data.images.length; i++) {
                    imageList.push(json.data.images[i]);
                }
            });
        // maybe it would be better to grab this data from imgur once and hold it as long as the bot is alive?
        message.channel.send(imageList[getRandomBetween(0, imageList.length)].gifv);
        logger.log(`!COMBO user: ${message.member.user.username} | guildId: ${message.guildId}`);
    }
};