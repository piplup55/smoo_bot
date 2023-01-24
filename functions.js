const { glob } = require("glob")
const { promisify } = require("util")
const proGlob = promisify(glob)
const path = require("node:path");
const fs = require("node:fs");

function gettime() {
  let date = new Date()
  let hour = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();

  return '[TIME]: ' + ((hour < 10) ? '0' + hour: hour) + ':' + ((minutes < 10) ? '0' + minutes: minutes) + ':' + ((seconds < 10) ? '0' + seconds: seconds)
}

async function loadFiles(dirName) {
    const Files = await proGlob(`${process.cwd().replace(/\\/g, "/")}/${dirName}/**/*.js`)
    Files.forEach((file) => delete require.cache[require.resolve(file)])
    return Files
}

async function loadCommands(client) {

  let commandsArray = []

  const Files = await loadFiles("commands")

  Files.forEach((file) => {
      const command = require(file)

      if(command.subCommand) return client.subcommands.set(command.subCommand, command)

      client.commands.set(command.data.name, command)

      commandsArray.push(command.data.toJSON())

      console.log(`${gettime()} [COMMAND]: Loaded ${command.data.name}, status: ✔ Loaded`)
  })

  guild = await client.guilds.cache.get(client.config.discord.guildId);

  guild.commands.set(commandsArray)

}

function loadEvents(client) {

  const eventsPath = path.join(__dirname, "events");
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
}

module.exports = { loadCommands, loadEvents, gettime }
