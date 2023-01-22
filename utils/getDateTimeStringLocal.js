module.exports = function(d = new Date(), showSeconds = true) {
    const dateInfoLocal = {
        month: d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1,
        date: d.getDate() < 10 ? '0' + d.getDate() : d.getDate(),
        year: `${d.getFullYear()}`.substring(2),
        hours: d.getHours() < 10 ? '0' + d.getHours() : d.getHours(),
        minutes: d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes(),
        seconds: d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds()
    };
    
    let output = `${dateInfoLocal.month}/${dateInfoLocal.date}/${dateInfoLocal.year} ${dateInfoLocal.hours}:${dateInfoLocal.minutes}`;
    if (showSeconds) {
        output += `:${dateInfoLocal.seconds}`;
    }

    return output;
};