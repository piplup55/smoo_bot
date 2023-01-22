const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a streamer from the list of chats to multiban from.")
    .addStringOption((option) =>
      option
        .setName("streamer")
        .setDescription("The streamer to remove")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();
    var streamer = interaction.options.getString("streamer");
    // if there isnt a '#' at the beginning of the channel name, add it
    if (streamer.charAt(0) !== "#") {
      streamer = "#" + streamer;
    }
    const index = interaction.client.twitchClient.channels.indexOf(streamer);
    if (index > -1) {
      interaction.client.twitchClient.channels.splice(index, 1);
    }
    await interaction.editReply(
      "Removed " + streamer + " from the list of streamers to multiban from."
    );
  },
};
