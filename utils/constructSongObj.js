const getTimeString = require('./getTimeString');

module.exports = function(video, voiceChannel, user, timestamp) {
    let duration = getTimeString(video.duration);
    if (duration === '00:00') duration = 'Live Stream';
    // checks if the user searched for a song using a Spotify URL
    let url =
        video.duration[1] == true
            ? video.url
            : `https://www.youtube.com/watch?v=${video.raw.id}`;
    return {
        url,
        title: video.title,
        rawDuration: video.duration,
        duration,
        timestamp,
        thumbnail: video.thumbnails.high.url,
        voiceChannel,
        memberDisplayName: user.username,
        memberAvatar: user.avatarURL('webp', false, 16)
    };
};
