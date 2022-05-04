:start
call git pull
set NODE_ENV=production
call npm install
call node .
goto start