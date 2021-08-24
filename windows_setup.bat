@ECHO OFF
ECHO running setup...
ECHO creating .env file...
ECHO DISCORD_TOKEN={your-discord-bot-token} > .env
ECHO CLIENT_ID={your-discord-client-id} > .env
ECHO npm install
CALL npm install
ECHO setup complete
PAUSE