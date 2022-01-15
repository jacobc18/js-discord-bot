require('./utils/getDotenv');

const fs = require('fs');
const { Client, Intents, Collection } = require('discord.js');
const voiceStateUpdateHandler = require('./handlers/voiceStateUpdateHandler');

const BOT_OWNER_ID = '189181051216592896';

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
  if (command.aliases) {
    for (let alias of command.aliases) {
      client.commands.set(alias, command);
    }
  }
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
    if (interaction.deferred || interaction.replied) {
      return interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
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
    } else {
      message.channel.send('Tell me what to say ya bimbus.');
    }
  } else { message.channel.send('not a valid command'); }
});

client.on('voiceStateUpdate', (oldState, newState) => {
  try {
    voiceStateUpdateHandler(client, oldState, newState);
  } catch (err) {
    console.log(err);
  }
});

process.on('unhandledRejection', async err => {
  console.log(err);

  const owner = await client.users.fetch(BOT_OWNER_ID);
  await owner.send(`${err}`);

  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);