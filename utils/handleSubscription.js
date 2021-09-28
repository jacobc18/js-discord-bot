const {
    joinVoiceChannel,
    entersState,
    VoiceConnectionStatus
} =  require('@discordjs/voice');
const deleteMusicPlayerIfNeeded = require('./deleteMusicPlayerIfNeeded');

module.exports = async (queue, interaction, player) => {
    let voiceChannel = queue[0].voiceChannel;
    if (!voiceChannel) {
        voiceChannel = interaction.member.voice.channel;
    }
    const title = player.queue[0].title;
    let connection = player.connection;
    if (!connection) {
        connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator
        });
        connection.on('error', console.error);
    }
    player.textChannel = interaction.channel;
    player.passConnection(connection);
  
    try {
        await entersState(player.connection, VoiceConnectionStatus.Ready, 10000);
    } catch (err) {
        deleteMusicPlayerIfNeeded(interaction);
        console.error(err);
        await interaction.reply({ content: 'Failed to join your channel' });

        return;
    }
    player.process(player.queue);
    await interaction.reply(`Now playing ${title}`);
};
