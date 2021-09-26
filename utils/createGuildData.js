const guildConfigs = require('../config/guild.json');

const defaultGuildGreetings = [
    'welcome *NAME*'
];

module.exports = function(guildId) {
    let guildConfig = {};
    if (guildId && guildConfigs[guildId]) {
        guildConfig = guildConfigs[guildId];
    }
    return {
        queueHistory: [],
        greetings: defaultGuildGreetings,
        ...guildConfig
    };
};