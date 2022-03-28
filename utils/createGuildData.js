const {
    getGuild: apiGetGuild
} = require('../services/pastramiApi');

const logger = require('../utils/logger');

const defaultGuildGreetings = [
    'welcome *NAME*'
];

module.exports = async function(guildId) {
    let guildConfig = await apiGetGuild(guildId);
    if (guildConfig.error) {
        logger.log(`CALL createGuildData ERROR guildId: ${guildId}`);
        guildConfig = {};
    }
    return {
        queueHistory: [],
        greetings: defaultGuildGreetings,
        ...guildConfig
    };
};