const say = require('say');
const fs = require('fs');

const {
	joinVoiceChannel,
	entersState,
    createAudioResource,
    createAudioPlayer,
    AudioPlayerStatus,
	VoiceConnectionStatus,
    StreamType,
} =  require('@discordjs/voice');

const TTS_AUDIO_DIR_PATH = './temp';

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

module.exports = async function speakText(voiceChannel, text) {
    if (!fs.existsSync(TTS_AUDIO_DIR_PATH)){
        fs.mkdirSync(TTS_AUDIO_DIR_PATH);
    }
    const timestamp = new Date().getTime();
    const soundPath = `${TTS_AUDIO_DIR_PATH}/${timestamp}.mp3`;
    say.export(text, 'Microsoft Zira Desktop', 1, soundPath, async() => {
        const connection = await connectToChannel(voiceChannel);

        const player = createAudioPlayer();

        player.on(AudioPlayerStatus.Idle, () => {
            player.stop();
            connection.destroy();
            if (fs.existsSync(TTS_AUDIO_DIR_PATH)) {
                fs.rmSync(TTS_AUDIO_DIR_PATH, { recursive: true })
            }
        });

        player.on('error', err => {
            console.error(err);
        });

        try {
            await playAudioFile(player, soundPath);
            connection.subscribe(player);
        } catch (err) {
            player.stop();
            connection.destroy();
            if (fs.existsSync(TTS_AUDIO_DIR_PATH)) {
                fs.rmSync(TTS_AUDIO_DIR_PATH, { recursive: true })
            }
            console.error(err);
        }
    });
}