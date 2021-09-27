// returns 'HH:MM:SS' or if HH is missing returns MM:SS
module.exports = function(timeObj) {
    if (timeObj[1] === true) return timeObj[0];

    return `${timeObj.hours ? timeObj.hours + ':' : ''}${
        timeObj.minutes ? timeObj.minutes : '00'
    }:${
        timeObj.seconds < 10
            ? '0' + timeObj.seconds
            : timeObj.seconds
            ? timeObj.seconds
            : '00'
    }`;
};
