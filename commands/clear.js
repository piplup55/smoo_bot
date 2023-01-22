const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription(
      "Clear the list of chats to multiban from."
    ),
  async execute(interaction) {
    await interaction.deferReply();
    interaction.client.twitchClient.channels = [];
    await interaction.editReply("Cleared the list of streamers to multiban from.");
  },
};
