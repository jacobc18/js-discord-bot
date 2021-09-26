/**
 * Run this file to register all slash (/) commands located in ./commands
 * to the guilds (servers) which have ids in the `guildIDs` array below
 */

require('dotenv').config();

const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const guildIDs = [
    '845049398283075604', // JeekDevServer
    '189901212232056832', // Jake Feeds Poros
    '206912393601613825', // low-res friends
];

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
    if (command.data && (command.data.type && command.data.type !== 'text') || !command.data.type) {
	    commands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

        for (let i = 0; i < guildIDs.length; ++i) {
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, guildIDs[i]),
                { body: commands },
            );
        }

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
    }
})();