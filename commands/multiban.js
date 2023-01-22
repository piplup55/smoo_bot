const { SlashCommandBuilder } = require("discord.js");

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("multiban")
    .setDescription("bans a user from everyone's twitch chat")
    .addStringOption((option) =>
      option.setName("user").setDescription("The user to ban").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the ban")
        .setRequired(false)
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const user = interaction.options.getString("user");

    const client = interaction.client.twitchClient;

    var reason;

    if (interaction.options.getString("reason")) {
      reason = interaction.options.getString("reason");
    } else {
      reason = "Spoiling hide and seek";
    }

    channels = client.channels;
    for (let i = 0; i < channels.length; i++) {
      client
        .ban(channels[i], user, reason)
        .then(() => {
          console.log("Banned " + user + " from " + channels[i]);
        })
        .catch((err) => {
          console.log("Error: " + err);
        });
      await delay(1000);
    }
    await interaction.editReply("Banned " + user + " from all channels.");
  },
};
