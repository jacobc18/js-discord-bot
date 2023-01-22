module.exports = function(currentTimestamp, lastTimestamp) {
    let hours = 0, minutes = 0, seconds = 0;
    let timeRemaining = (lastTimestamp + 86400000) - currentTimestamp;
    console.log(`current: ${currentTimestamp} last:${lastTimestamp} remaining: ${timeRemaining}`);
    hours = Math.floor(timeRemaining / 3600000);
    timeRemaining -= (hours * 3600000);
    minutes = Math.floor(timeRemaining / 60000);
    timeRemaining -= (minutes * 60000);
    seconds = Math.floor(timeRemaining / 1000);
    return `${hours} hours, ${minutes} minutes, and ${seconds} seconds`;
};