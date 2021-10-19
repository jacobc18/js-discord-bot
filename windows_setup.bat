@ECHO OFF
ECHO running setup...
ECHO creating .env file...
(
    ECHO DISCORD_TOKEN=your-discord-bot-token
    ECHO CLIENT_ID=your-discord-client-id
    ECHO YOUTUBE_API_KEY=your-youtube-api-key
    ECHO IMGUR_CLIENT_ID=your-imgur-client-id
    ECHO SPOTIFY_CLIENT_ID=your-spotify-client-id
    ECHO SPOTIFY_SECRET=your-spotify-secret
    ECHO LOGGING=0
) > .env
ECHO npm install
CALL npm install
ECHO setup complete
PAUSE