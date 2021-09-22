const {
	joinVoiceChannel,
	entersState,
    createAudioResource,
    createAudioPlayer,
    AudioPlayerStatus,
	VoiceConnectionStatus,
    StreamType,
} =  require('@discordjs/voice');

async function connectToChannel(channel) {
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator
	});

	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
		return connection;
	} catch (error) {
		connection.destroy();
		throw error;
	}
}

function playAudioFile(player, filePath) {
	const resource = createAudioResource(filePath, {
		inputType: StreamType.Arbitrary
	});
	player.play(resource);

    // rejects if doesn't enter playing state within 5 seconds
	return entersState(player, AudioPlayerStatus.Playing, 5e3);
}

module.exports = async function connectAndPlayAudioFile(voiceChannel, filePath) {
    const connection = await connectToChannel(voiceChannel);

    const player = createAudioPlayer();

    player.on(AudioPlayerStatus.Idle, () => {
        player.stop();
        connection.destroy();
    });

    try {
        await playAudioFile(player, filePath);
        connection.subscribe(player);
    } catch (err) {
        console.error(err);
    }
}