const { SlashCommandBuilder } = require("discord.js");

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription(
      "Test connection to twitch chat for all streamers in the list."
    ),
  async execute(interaction) {
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
      await delay(1000);
    }
    await interaction.editReply("Sent messages to all channels.");
  },
};
