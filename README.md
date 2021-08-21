# js-discord-bot
a discord bot for gambling and other miscellaneous functions

made by loosely following [this guide](https://dev.to/hypening/build-a-discord-bot-with-discord-js-v13-14mj)

## Setup
Make sure you have the v16.x.x or higher of NodeJS installed as well as the latest version of NPM.

### Automatic setup for Windows
```bash
$ windows_setup.bat
```

### Manual Setup
```bash
$ npm install
```

Create a file within the repo folder name `.env` with content:
```.env
DISCORD_TOKEN={your-discord-bot-token}
```

Replace `'{your-discord-bot-token}'` with your Discord bot token

## Development
After you've completed the setup you should be able to run
```bash
$ node index.js
```
This will run the bot locally on your machine which will connect to any guilds you've set it to connect to within [Discord's Developer Portal](http://discordapp.com/developers/applications) for the bot. (See: [How to Make a Discord Bot in the Developer Portal](https://realpython.com/how-to-make-a-discord-bot-python/#how-to-make-a-discord-bot-in-the-developer-portal))

## Registering Slash (/) Commands
```bash
$ node registerSlashCommands.js
```
Running this will register all slash commands under `/commands` to the guilds (servers) who have IDs within the `guildIDs` array within the `registerSlashCommands.js` file.

Slash commands are only included in DiscordJS v13.x.x or higher. For more information on slash (/) commands and registering them see [Discord's documentation](https://discordjs.guide/interactions/registering-slash-commands.html#guild-commands).

---

### ideas/todo
1. accrue tokens with activity
2. distribute tokens person to person
3. records log of every bet and distribution of tokens
4. *salsa*
5. register different kinds of bets (rng, bets regarding users, bets regarding collectives)
6. **guac**
7. algorithm that determines odds payouts based on bet sizes for each outcome, or even use data to determine likelihood of an event (use porofessor to retrieve winrates, etc)
8. distribute base amount of tokens
9. cash in tokens for discord/gaming privileges/punishments
10. roll_deez
11. roll_meez_shinz
12. quotes
13. ask for quote of specific user
14. after for random or numbered quote