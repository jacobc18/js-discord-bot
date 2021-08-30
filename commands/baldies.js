const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const readFile = require('../utils/readFile');
const getRandomBetween = require('../utils/getRandomBetween');
const logger = require('../utils/logger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('baldies')
		.setDescription('wiki link to a random famous person is currently bald or was bald at any point in their adult life'),
	async execute(interaction) {
        const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('cmd:baldies')
					.setLabel('Get another baldy')
					.setStyle('PRIMARY'),
			);

        if (getRandomBetween(1, 69) === 69) {
            await interaction.reply({
                content: 'The bald boy who inspired them all, Haden Brock, <@617533047482351626>: https://www.facebook.com/haden.brock \n https://imgur.com/a/Vrzbx7W',
                components: [row]
            });
        }

        const baldies = [];
        await readFile('./data/famousBaldPeople.txt', (line) => {
            baldies.push(line);
        });

        const randomBaldy = baldies[getRandomBetween(0, baldies.length - 1)];

        logger.log(`/BALDIES user: ${interaction.member.user.username}`);

		await interaction.reply({
            content: `https://en.wikipedia.org/w/index.php?search=${randomBaldy.replaceAll(' ', '+')}`,
            components: [row]
        });
	}
};