const { SlashCommandBuilder } = require('@discordjs/builders');
const readline = require('readline');
const fs = require('fs');
const readFile = require('../utils/readFile');
const getRandomBetween = require('../utils/getRandomBetween');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('baldies')
		.setDescription('wiki link to a random famous person is currently bald or was bald at any point in their adult life'),
	async execute(interaction) {
        if (getRandomBetween(1, 69) === 69) {
            await interaction.reply('The bald boy who inspired them all, Haden Brock, <@617533047482351626>: https://www.facebook.com/haden.brock \n https://imgur.com/a/Vrzbx7W');
        }

        const baldies = [];
        await readFile('./data/famousBaldPeople.txt', (line) => {
            baldies.push(line);
        });
        
        const randomBaldy = baldies[getRandomBetween(0, baldies.length - 1)];

		await interaction.reply(`https://en.wikipedia.org/w/index.php?search=${randomBaldy.replaceAll(' ', '+')}`);
	},
};