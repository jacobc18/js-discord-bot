require('dotenv').config();

const fs = require('fs');
const { Client, Intents, Collection } = require('discord.js');
const fetch = require('node-fetch');
const voiceStateUpdateHandler = require('./handlers/voiceStateUpdateHandler');
const getRandomBetween = require('./utils/getRandomBetween');


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

client.once('ready', () => {
 client.musicPlayerManager = new Map();
 client.guildData = new Collection();
});

client.on('ready', () => {
  // client.user.setUsername('Pastrami');
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

client.on('messageCreate', async message => {
  if (message.content.charAt(0) !== '!') return;
  if (message.author.bot) return;

  const splitArgs = message.content.split(' ');
  const command = splitArgs.shift().substring(1);
  
  if (client.commands.has(command)) {
    await client.commands.get(command).execute(message, splitArgs);
  } else if (command === 'echo') {
    if (splitArgs.length > 0) {
      message.channel.send(splitArgs.join(' '));
    }
    else {
      message.channel.send('Tell me what to say ya bimbus.');
    }
  } else if (command === 'combo') { 
    // can we set this command up as a module similar to how the slash command are set up?
    const imageList = [];
    const fetchParams = {
      method: "get",
      headers: {
          // Jake, about adding this client ID to .env file
          Authorization: "Client-ID " + process.env.IMGUR_CLIENT_ID
      }
    };
    // imgur gallery hash is static for now, can be dynamic in the future
    await fetch('https://api.imgur.com/3/gallery/zh0IJgo', fetchParams).then(response => response.json())
      .then(json => {
        console.log(json.data.images.length);
        for (let i = 0; i < json.data.images.length; i++) {
          imageList.push(json.data.images[i]);
        }
    });
    message.channel.send(imageList[getRandomBetween(0, imageList.length)].gifv);

  } else { message.channel.send('not a valid command'); }
});

client.on('voiceStateUpdate', (oldState, newState) => {
  try {
    voiceStateUpdateHandler(client, oldState, newState);
  } catch (err) {
    console.log(err);
  }
});

client.login(process.env.DISCORD_TOKEN);