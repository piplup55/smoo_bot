// Require the necessary discord.js classes
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const tmi = require("tmi.js");
const { exit } = require("node:process");

// Create a new client instance
const client = new Client({
  intents: [],
});
client.config = require("./config.json")
client.functions = require("./functions.js")
client.commands = new Collection()
client.subcommands = new Collection()

const init = async () => {
  // Check if the access token is valid, if not, create a new one
  // Mainly just a GET request to https://id.twitch.tv/oauth2/validate to check if the token is valid
  // If it is not, sends a POST request to https://id.twitch.tv/oauth2/token to get a new access token
  const access_token = await client.functions.checkTwitchToken(client);

  const opts = {
    identity: {
      username: client.config.twitch.username,
      password: access_token,
    },
    channels: client.config.twitch.streamers,
    reconnectInterval: 5000,
  };

  const twitchClient = new tmi.client(opts);

  // Define configuration options for the Twitch client

  console.log(`${client.functions.gettime()} Connecting to Twitch...`);

  // Create a client with our options

  // When the twitch client connects, log the address and port to the console
  twitchClient.on("connected", (address, port) => {
    console.log(`${client.functions.gettime()} Connected to ${address}:${port}`);
  });

  twitchClient.connect().then(() => {
      console.log(`${client.functions.gettime()} Connected to Twitch!`);
    }).catch((err) => {
      console.log(`${client.functions.gettime()} Error connecting to Twitch: ${err}`);
    });

  // Ping the Twitch server every 5 minutes to avoid being disconnected
  setInterval(() => {
    twitchClient.ping().then((data) => {
        // console.log("Ping: " + data);
      }).catch((err) => {
        console.log(`Error: ${err}`);
        exit(0);
      });
  }, 60000);
  // attach the twitch client to the discord client so I can access it in command files
  client.twitchClient = twitchClient;

  // Log in to Discord with your client's token
  client.login(client.config.discord.token).then(() => { client.functions.loadEvents(client); client.functions.loadCommands(client) })
};

init();
