# PASTRAMI BOT

[![GitHub issues](https://img.shields.io/github/issues/jacobc18/js-discord-bot)](https://github.com/jacobc18/js-discord-bot/issues)

Pastrami is a multifunctional JavaScript Discord bot with abilities including:

- TTS greetings for voice channel user join

- Audio streaming via YouTube links 


> gif maybe? 

## Installation

Requires [NodeJS v16.x.x](https://nodejs.org/en/) or higher and the latest version of [NPM](https://docs.npmjs.com/cli/v7/commands/npm-install)

**Windows**

```powershell
$ windows_setup.bat
```

**Manual**

In package directory run:

```powershell
$ npm install
```

## Setup

In the repo folder create a file called ``` .env ``` with the contents:

```powershell
DISCORD_TOKEN=your-discord-bot-token-goes-here
CLIENT_ID=your-discord-client-id-goes-here
```

To get a Discord bot token and Discord client ID see [How to Make a Discord Bot in the Developer Portal](https://realpython.com/how-to-make-a-discord-bot-python/#how-to-make-a-discord-bot-in-the-developer-portal)

We utilize [say.js](https://github.com/Marak/say.js) to convert text strings to .mp3 files. Say.js uses some [FFMpeg](https://www.ffmpeg.org/) libraries to operate, so you will need to install the most up to date version. You can learn how to do that [here](https://www.wikihow.com/Install-FFmpeg-on-Windows). 

- Note that say.js uses Festival to operate on Linux, so check their [README](https://github.com/Marak/say.js/blob/master/README.md) to get that squared away

## Usage

To start the bot locally on your machine run

```powershell
$ node index.js
```

This will also connect the bot to any guilds you have linked it to via [Discord's Developer Portal](http://discordapp.com/developers/applications)

