require('./utils/getDotenv');

const fs = require('fs');
const { Client, Intents, Collection } = require('discord.js');

const sendBotOwnerDM = require('./utils/sendBotOwnerDM');
const voiceStateUpdateHandler = require('./handlers/voiceStateUpdateHandler');
const { getIsUserBanned } = require('./services/pastramiApi');

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
  Intents.FLAGS.DIRECT_MESSAGES,
  Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
  Intents.FLAGS.DIRECT_MESSAGE_TYPING
],
partials: [
    'CHANNEL', // Required to receive DMs
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
  if (getIsUserBanned(interaction.author.id)) {
    await message.channel.send('You\'ve been naughty! I\'m not listening to you!');
    return;
  }

  let args = [];

  if (isButtonInteraction) {
    const splitButtonCustomId = interaction.customId.split('cmd:');
    if (splitButtonCustomId.length > 1) {
      const splitButtonCommand = splitButtonCustomId[1].split(' ');
      commandName = splitButtonCommand.length === 1 ? splitButtonCustomId[1] : splitButtonCommand[0];
      if (splitButtonCommand.length > 1) {
        args = splitButtonCommand.slice(1);
      }
    } else {

      // handle non-command button interactions here
      return;
    }
  }

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);

  if (!command) return;

  try {
    await client.commands.get(commandName).execute(interaction, args);
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

  if (getIsUserBanned(message.author.id)) {
    await message.channel.send('You\'ve been naughty! I\'m not listening to you!');
    return;
  }

  const splitArgs = message.content.split(' ');
  const command = splitArgs.shift().substring(1);

  if (command === 'report') {
    await sendBotOwnerDM(client, `"${message.content}" FROM ${message.author.username} (${message.author.id})`);
    await message.channel.send('I sent your report! Thank you');
    return;
  }

  if (client.commands.has(command)) {
    await client.commands.get(command).execute(message, splitArgs);
  } else if (command === 'echo') {
    if (splitArgs.length > 0) {
      await message.channel.send(splitArgs.join(' '));
    } else {
      message.channel.send('Tell me what to say ya bimbus.');
    }
  } else {
    await message.channel.send('not a valid command');
  }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  try {
    await voiceStateUpdateHandler(client, oldState, newState);
  } catch (err) {
    console.log(err);
  }
});

process.on('unhandledRejection', async err => {
  console.log(err);
  await sendBotOwnerDM(client, `${err}`);

  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);