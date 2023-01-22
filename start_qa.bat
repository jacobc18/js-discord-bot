:start
set NODE_ENV=development
call npm install
call node registerSlashCommands.js
call node .
goto start