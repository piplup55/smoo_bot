const { Events } = require("discord.js");
const { gettime } = require("../functions.js")

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      return console.error(`No command matching ${interaction.commandName} was found.`);
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`${gettime()} Error executing ${interaction.commandName}`);
      console.error(error);
    }

    console.log(`${gettime()} ${interaction.user.tag} used the ${interaction.commandName} command.`);
  },
};
