@ECHO OFF
ECHO running setup...
ECHO creating .env file...
ECHO DISCORD_TOKEN={your-discord-bot-token} > .env
ECHO npm install
CALL npm install
ECHO setup complete
PAUSE