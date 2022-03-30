# PASTRAMI BOT

[![GitHub issues](https://img.shields.io/github/issues/jacobc18/js-discord-bot)](https://github.com/jacobc18/js-discord-bot/issues)

![hello there](https://media.giphy.com/media/3ornk57KwDXf81rjWM/giphy.gif)


# !!!README IS NOT ENTIRELY UP TO DATE!!!

Pastrami is a multifunctional JavaScript Discord bot with abilities including

- TTS greetings for voice channel user join
- Audio streaming via YouTube links 
- Audio streaming via local files
- TTS readings of given strings
- Information on famous bald people

## Installation

Requires [NodeJS v16.x.x](https://nodejs.org/en/) or higher and the latest version of [NPM](https://docs.npmjs.com/cli/v7/commands/npm-install)

### Python install

For voice/tts capabilities to work your will need to install Python v2 or greater. You can download the latest version of Python [here](https://www.python.org/downloads/).

### Windows

```
$ windows_setup.bat
```

### Manual

In package directory run

```
$ npm install
```

## Setup

### Linking the Bot

In the repo folder create a file called ```.env.production``` and ```.env.development``` each with the contents

```
DISCORD_TOKEN=your-discord-bot-token-goes-here
CLIENT_ID=your-discord-client-id-goes-here
YOUTUBE_API_KEY=your-youtube-api-key-goes-here
IMGUR_CLIENT_ID=your-imgur-client-id-goes-here
SPOTIFY_CLIENT_ID=your-spotify-client-id-goes-here
SPOTIFY_SECRET=your-spotify-secret-goes-here
LOGGING=0
```

###### Different environments:
The ```.env.production``` file should be used for running the production version of the bot while the ```.env.development``` file should be used for development. This is controlled by setting the `NODE_ENV` environment variable to either `production` or `development`. It is worth noting that the `.env.development` file is used by default if the `NODE_ENV` environment variable is not set or is set to something unexpected.

###### Discord token and client id:
To get a Discord bot token and Discord client ID see [How to Make a Discord Bot in the Developer Portal](https://realpython.com/how-to-make-a-discord-bot-python/#how-to-make-a-discord-bot-in-the-developer-portal).

###### Youtube API key:
To get a YouTube API key follow the steps outlined [here](https://developers.google.com/youtube/v3/getting-started).

###### Imgur client id:
To get an Imgur Client ID, you simply need an Imgur account. Register your bot (application) [here](https://api.imgur.com/oauth2/addclient) and fill out the form.
**Application Name** and **Email** are required fields. Under **Authorzation Type**, select *OAuth 2 authorization **without** a callback URL*. Imgur will then supply you with a fresh Client ID and Client Secret, but you only really need the Client ID. If you forget it or misplace it, your can access it again in you [Imgur Account Settings](https://imgur.com/account/settings/apps).

###### logging:
The logging environment variable can be set to `1` to log info to the console.

###### Spotify client id:
To get a Spotify Client ID and Spotify Secret you must first connect Spotify Developer to your Spotify account [here](https://developer.spotify.com/dashboard/login). Don't worry, this works with free accounts as well. Once the connection is made, create a new application. On the application dashboard you will find your Spotify Client ID and Spotify secret.

### Inviting the bot to server(s)
After following the steps outlined in [How to Make a Discord Bot in the Developer Portal](https://realpython.com/how-to-make-a-discord-bot-python/#how-to-make-a-discord-bot-in-the-developer-portal), you need to invite the bot to the Discord guilds you would like it to operate in. To do this you will need to navigate to your application in the [Discord Developer Portal](https://discord.com/developers/applications) and then to the ``` OAuth2``` tab. 

Here you will need to check the boxes for the ``` applications.command``` and ``` bot``` scopes. Then, you will need to choose which permissions you want the bot to have underneath the scope section. After this is done you should copy the url created by the scopes section and paste it into your browser. Then, choose the guild/guilds where you would like to add the bot.  

### Setting up Audio 

Pastrami uses [say.js](https://github.com/Marak/say.js) to convert text strings to mp3 files, and say.js uses some [FFMpeg](https://www.ffmpeg.org/) libraries to operate. You will need to install the most up to date version of FFMpeg. To do this, you can run

```
$ npm install ffmpeg-static
```

Or follow the guide [here](https://www.wikihow.com/Install-FFmpeg-on-Windows). 

(Note: say.js uses [Festival](https://www.cstr.ed.ac.uk/projects/festival/) to operate on Linux, so check their [README](https://github.com/Marak/say.js/blob/master/README.md) to get that squared away)

If you want to utilize Pastrami's audio streaming capabilities for localized content, you will need to populate ``` /data/audiofiles``` with the ```.mp3/.mp4/.wav``` files you would like to play.

### Registering Slash (/) Commands

First you will need to populate ``` registerSlashCommands.js``` with the unique guild identifiers of the guilds you would like to use slash commands in.

```
const guildIDs = [
    'xxxx', // guild-name
    'xxxx', // other-guild-name
];
```

Here, you will need to replace ```xxxx```  with the unique guild ID mentioned earlier. Then, you can put the human readable name of the guild after the comment ```//```  for ease of use.

*To find the unique identifiers for guilds and users check [this](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-) out.*

Next, you can register all slash commands by running 

```
$ node registerSlashCommands.js
```

Slash commands are only available in [DiscordJS v13.x.x](https://discordjs.guide/additional-info/changes-in-v13.html#before-you-start) or higher. For more info on slash commands check out [Discord's documentation](https://discordjs.guide/interactions/registering-slash-commands.html#guild-commands).

## Usage

### Startup 

To start the bot locally on your machine run

```
$ node index.js
```

This will also connect the bot to any guilds you have linked it to via [Discord's Developer Portal](http://discordapp.com/developers/applications). This is great for bot development.

To start a production version of the bot (windows only) run

```
$ start.bat
```

This will set `NODE_ENV` to `production` and restart the bot process on error. This can be terminated with cntrl + C and entering Y or killing the process otherwise.

### Greetings

- User Specific Greetings 

To customize user specific greetings navigate to ``` /data/users.json```. 

```json
"xxxx": {
        "greetings": [
            "welcome *NAME*",
            "this is a custom greeting for *NAME*",
            "Malachi is cool"
        ]
    },
```

The \*NAME\* string is used to reference the server nickname of the user who has joined the voice channel. You need to replace ``` xxxx``` with that user's unique identifier.

- Default Greetings 

To customize default greetings for guilds that do not have guild specific default greetings set, navigate to ``` /utils/createGuildData.js``` and edit the `defaultGuildGreetings` array:

```js
const defaultGuildGreetings = [
    'welcome *NAME*'
];
```

- Guild Specific Default Greetings 

You can set default greetings for a specific guild. This requires the unique guild identifier ( ``` xxxx``` ) to function. 

Navigate to ``` /config/guild.json```:

```json
"xxxx": {
        "greetings": [
            "It's *NAME*!",
            "*NAME* has arrived"
        ]
    },
```

*To find the unique identifiers for guilds and users check [this](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-) out.*

(Note: Greetings within the same grouping will be used randomly with equal probability)

### Commands

Pastrami bot offers a handful of commands. You can use these by typing the command into a text channel on any guild where Pastrami is active.

|Command|Modifier | Description |
|:---| :---: | :--- |
| ```!pastrami``` |```none``` |This command will display a list of all commands in a text channel. Alias: `!help` |
| ```!guild``` |```none``` |This command will display information about the guild. Alias: `!server` |
| ```!kanye``` |```none``` |This command will display a Kanye West quote generated via [Kanye Rest API](https://kanye.rest/). Alias: `!kanyesays`|
| ```!dadjoke``` |```none``` |This command will display a random dad joke via [icanhazdadjoke.com](https://icanhazdadjoke.com/). |
| ```!69ers``` |```none``` |This command will display the list of 69ers and their 69 counts. |
| ```!cd``` |```none``` |This command will display your 69er chance cooldown. |
| ```/baldies``` |```none``` |This command will post a wiki link to a random famous person who is currently bald or was bald at any point in their adult life. |
| ```/listaudio``` |```none``` | This command will list any audio files that are available to be played by Pastrami. The audio files listed will be pulled from the ``` /data/audiofiles``` folder mentioned earlier.|
| ```/playaudio``` | ```audio-file``` | This command will add Pastrami to the voice channel and play the audio file specified in the command. (Note: the audio file must be stored in ``` /data/audiofiles```) |
| ```/speak``` |```text-string``` | This command will add Pastrami to the voice channel and play a TTS reading of the text string specified in the command.|
| ```/yt ``` |```youtube-url```| This command will add Pastrami to the voice channel and play the audio corresponding to the YouTube link specified in the command.|
| ```!lichess ``` |```none```| This command will lists available !lichess commands.|
| ```!wordle``` |```none``` | This command will display information on how to play Wordle with Pastrami.|
| ```!report``` |```text-string``` | This command will report the given text-string (a bug or comment ideally) to the bot owner.|

## Contributions 

If you would like to contribute to Pastrami bot feel free to branch off of the [``` main```](https://github.com/jacobc18/js-discord-bot) branch with a meaningful branch name such as ``` feature/feature-name```. Please provide some useful information about code being committed in your branch. Lastly, create a Pull Request to the [``` main```](https://github.com/jacobc18/js-discord-bot) and tag [``` jacobc18```](https://github.com/jacobc18) as a reviewer.