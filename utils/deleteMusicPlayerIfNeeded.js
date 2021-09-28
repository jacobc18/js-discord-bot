module.exports = interaction => {
    const player = interaction.client.musicPlayerManager.get(interaction.guildId);
    if (player) {
        if (
            (player.queue.length && !player.nowPlaying) ||
            (!player.queue.length && !player.nowPlaying)
        )
        return;
      return interaction.client.musicPlayerManager.delete(interaction.guildId);
    }
};
