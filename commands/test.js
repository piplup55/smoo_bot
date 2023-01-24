const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription(
      "Test connection to twitch chat for all streamers in the list."
    ),
  async execute(interaction, client) {
    await interaction.deferReply();
    const client = interaction.client.twitchClient;
    channels = client.channels;
    for (let i = 0; i < channels.length; i++) {
      client
        .say(channels[i], "Hello, world!")
        .then(() => {
          console.log("Sent message to " + channels[i]);
        })
        .catch((err) => {
          console.log("Error: " + err);
        });
      await client.functions.delay(1000);
    }
    await interaction.editReply("Sent messages to all channels.");
  },
};
