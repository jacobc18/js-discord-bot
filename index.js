require('dotenv').config();

const fs = require('fs');
const { Client, Intents, Collection } = require('discord.js');
const voiceStateUpdateHandler = require('./handlers/voiceStateUpdateHandler');

const client = new Client({ intents: [
  Intents.FLAGS.GUILDS,
  // Intents.FLAGS.GUILD_MEMBERS,
  // Intents.FLAGS.GUILD_BANS,
  // Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
  // Intents.FLAGS.GUILD_INTEGRATIONS,
  // Intents.FLAGS.GUILD_WEBHOOKS,
  // Intents.FLAGS.GUILD_INVITES,
  Intents.FLAGS.GUILD_VOICE_STATES,
  // Intents.FLAGS.GUILD_PRESENCES,
  Intents.FLAGS.GUILD_MESSAGES,
  // Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  // Intents.FLAGS.GUILD_MESSAGE_TYPING,
  // Intents.FLAGS.DIRECT_MESSAGES,
  // Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
  // Intents.FLAGS.DIRECT_MESSAGE_TYPING
]});
client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  const isButtonInteraction = interaction.isButton();

	if (!interaction.isCommand() && !isButtonInteraction) return;

  let { commandName } = interaction;

  if (isButtonInteraction) {
    const splitButtonCustomId = interaction.customId.split('cmd:');
    if (splitButtonCustomId.length > 1) {
      commandName = splitButtonCustomId[1];
    } else {

      // handle non-command button interactions here
      return;
    }
  }
  
	if (!client.commands.has(commandName)) return;

	const command = client.commands.get(commandName);

	if (!command) return;

	try {
		await client.commands.get(commandName).execute(interaction);
	} catch (error) {
		console.error(error);
		return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

client.on('messageCreate', message => {
  if (message.content.charAt(0) !== '!') return;

  const splitMsg = message.content.split(' ');
  const command = splitMsg.shift().substring(1);

  if (command === 'echo') {
    message.channel.send(splitMsg.join(' '));
  }
});

client.on('voiceStateUpdate', (oldState, newState) => {
  voiceStateUpdateHandler(client, oldState, newState);
});

client.login(process.env.DISCORD_TOKEN);