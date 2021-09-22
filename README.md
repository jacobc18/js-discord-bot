# PASTRAMI BOT

[![GitHub issues](https://img.shields.io/github/issues/jacobc18/js-discord-bot)](https://github.com/jacobc18/js-discord-bot/issues)

<img align="left" src="https://media.giphy.com/media/3ornk57KwDXf81rjWM/giphy.gif">

Pastrami is a multifunctional JavaScript Discord bot with abilities including:

- TTS greetings for voice channel user join
- Audio streaming via YouTube links 
- Information on famous bald people

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

We utilize [say.js](https://github.com/Marak/say.js) to convert text strings to mp3 files. Say.js uses some [FFMpeg](https://www.ffmpeg.org/) libraries to operate, so you will need to install the most up to date version. You can learn how to do that [here](https://www.wikihow.com/Install-FFmpeg-on-Windows). 

- Note that say.js uses Festival to operate on Linux, so check their [README](https://github.com/Marak/say.js/blob/master/README.md) to get that squared away

If you want to utilize Pastrami's audio streaming capabilities for non YouTube content, you will need to populate ``` /data/audiofiles``` with the mp3/mp4 files you would like to play.

## Usage

**Startup** 

To start the bot locally on your machine run

```powershell
$ node index.js
```

This will also connect the bot to any guilds you have linked it to via [Discord's Developer Portal](http://discordapp.com/developers/applications)

**Greetings**

To customize greetings navigate to ``` /data/greetings.json```. 

- Default Greetings

```json
"default": {
        "greetings": [
            "welcome *NAME*",
            "say hi to *NAME*"
        ]
    },
```

In ``` greetings.json```  the \*NAME\* variable is used to reference the server nickname of the user who has joined the voice channel. 

- Guild Default Greetings 

```json
"xxxx": {
        "greetings": [
            "It's *NAME*!",
            "*NAME* has arrived"
        ]
    },
```

This is pretty much the same as the default greetings, but it requires the unique guild identifier ( ``` xxxx``` ) to function. 

- User Specific Greetings

```json
"xxxx": {
        "greetings": [
            "Malachi is cool",
            "Everyone likes Malachi"
        ]
    },
```

Again, this is pretty similar to the previous greeting formats. However, for user specific greetings you need to replace ``` xxxx``` with that user's unique identifier. 

*To find the unique identifiers for guilds and users check [this](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-) out.*

(Note: Greetings within the same grouping will be used randomly with equal probability)

**Slash Commands**

Pastrami bot offers a handful of slash commands. You can use these by typing the command into a text channel on any guild where Pastrami is active.

```powershell
/baldies
```

This command will post a wiki link to a random famous person who is currently bald or was bald at any point in their adult life. 

```powershell
/listaudio
```

This command will list any audio files that are available to be played by Pastrami. The audio files listed will be pulled from the ``` /data/audiofiles``` folder mentioned earlier.

```powershell
/playaudio name-of-audio-file
```

This command will add Pastrami to the voice channel and play the audio file specified in the command. (Note: the audio file must be stored in ``` /data/audiofiles```)

```powershell
/speak your-text-string-goes-here
```

This command will add Pastrami to the voice channel and play a TTS reading of the text string specified in the command.

```powershell
/yt youtube-url-goes-here
```

This command will add Pastrami to the voice channel and play the audio corresponding to the YouTube link specified in the command.

## Contributions 

If you would like to contribute to Pastrami bot feel free to branch off of the [``` main```](https://github.com/jacobc18/js-discord-bot) branch with a meaningful branch name such as ``` feature/feature-name```. Please provide some useful information about code being committed in your branch. Lastly, create a Pull Request to the [``` main```](https://github.com/jacobc18/js-discord-bot) and tag [``` jacobc18```](https://github.com/jacobc18) as a reviewer.
