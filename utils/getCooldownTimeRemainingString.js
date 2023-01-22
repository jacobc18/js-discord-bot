const { DAY_MS, HOUR_MS, MINUTE_MS, SECOND_MS } = require('../utils/constants');

module.exports = function(currentTimestamp, lastTimestamp) {
    let hours = 0, minutes = 0, seconds = 0;
    let timeRemaining = (lastTimestamp + DAY_MS) - currentTimestamp;
    console.log(`current: ${currentTimestamp} last:${lastTimestamp} remaining: ${timeRemaining}`);
    hours = Math.floor(timeRemaining / HOUR_MS);
    timeRemaining -= (hours * HOUR_MS);
    minutes = Math.floor(timeRemaining / MINUTE_MS);
    timeRemaining -= (minutes * MINUTE_MS);
    seconds = Math.floor(timeRemaining / SECOND_MS);
    return `${hours} hours, ${minutes} minutes, and ${seconds} seconds`;
};