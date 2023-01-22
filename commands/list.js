const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list")
    .setDescription("List all streamers in the list of chats to multiban from."),
  async execute(interaction) {
    await interaction.deferReply();
    const client = interaction.client.twitchClient;
    const channels = client.channels;
    if (channels.length === 0) {
        await interaction.editReply("There are no streamers in the list of streamers to multiban from.");
        return;
    }
    var output = "";
    for (let i = 0; i < client.channels.length; i++) {
        // if there is a '#' at the beginning of the channel name, remove it
        var channel = client.channels[i];
        if (channel.charAt(0) === '#') {
            channel = channel.substring(1);
        }
        output += channel + "\n";
    }
    await interaction.editReply("List of streamers to multiban from:\n" + output);
  },
};
