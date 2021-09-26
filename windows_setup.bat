@ECHO OFF
ECHO running setup...
ECHO creating .env file...
(
    ECHO DISCORD_TOKEN=your-discord-bot-token
    ECHO CLIENT_ID=your-discord-client-id
    ECHO YOUTUBE_API_KEY=your-youtube-api-key
    ECHO LOGGING=0
) > .env
ECHO npm install
CALL npm install
ECHO setup complete
PAUSE