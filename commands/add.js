const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add")
    .setDescription("Add a streamer to the list of chats to multiban from.")
    .addStringOption((option) =>
      option.setName("streamer").setDescription("The streamer to add").setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();
    var streamer = interaction.options.getString("streamer");
    // if there isnt a '#' at the beginning of the channel name, add it
    if (streamer.charAt(0) !== "#") {
      streamer = "#" + streamer;
    }
    interaction.client.twitchClient.channels.push(streamer);
    await interaction.editReply("Added " + streamer + " to the list of streamers to multiban from.");
  },
};
