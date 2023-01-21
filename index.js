// Require the necessary discord.js classes
const fs = require("node:fs");
const path = require("node:path");
const https = require("https");
const querystring = require("querystring");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const {
  token,
  botUsername,
  botPassword,
  twitchClientId,
  twitchClientSecret,
  twitchRefreshToken,
} = require("./config.json");
const tmi = require("tmi.js");
const file = require("./config.json");

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
  ],
});

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

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

// Define configuration options
const opts = {
  identity: {
    username: botUsername,
    password: botPassword,
  },
  channels: ["skeegan123"],
  reconnectInterval: 5000,
};

console.log("Connecting to Twitch...");

// Create a client with our options
var twitchClient = new tmi.client(opts);

// Connect to Twitch:
twitchClient.connect().then(() => {
  setInterval(() => {
    twitchClient
      .ping()
      .then((data) => {
        console.log("Ping: " + data);
      })
      .catch((err) => {
        console.log("Error: " + err);
      });
  }, 300000);
}).catch((err) => {
  console.log("Error: " + err);
});



// twitchClient.on("connecting", (address, port) => {
//   // Replace YOUR_ACCESS_TOKEN with the actual access token
//   const access_token = botPassword;

//   const getOptions = {
//     hostname: "id.twitch.tv",
//     path: "/oauth2/validate",
//     headers: {
//       Authorization: "OAuth " + access_token,
//       "Client-ID": twitchClientId,
//     },
//   };

//   https
//     .get(getOptions, (response) => {
//       const { statusCode } = response;
//       const contentType = response.headers["content-type"];

//       let error;
//       if (statusCode !== 200) {
//         error = new Error("Request Failed.\n" + `Status Code: ${statusCode}`);
//         console.log("There was an error... Creating a new access token...");
//         // Create a post request to get a new access token
//         const client_id = twitchClientId;
//         const client_secret = twitchClientSecret;
//         const refresh_token = twitchRefreshToken;

//         const data = querystring.stringify({
//           client_id: client_id,
//           client_secret: client_secret,
//           grant_type: "refresh_token",
//           refresh_token: refresh_token,
//         });

//         const options = {
//           hostname: "id.twitch.tv",
//           path: "/oauth2/token",
//           method: "POST",
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//             "Content-Length": data.length,
//           },
//         };

//         const req = https.request(options, (res) => {
//           const { statusCode } = res;
//           const contentType = res.headers["content-type"];

//           let error;
//           if (statusCode !== 200) {
//             error = new Error(
//               "Request Failed.\n" + `Status Code: ${statusCode}`
//             );
//           }

//           res.setEncoding("utf8");
//           let rawData = "";
//           res.on("data", (chunk) => {
//             rawData += chunk;
//           });
//           res.on("end", () => {
//             try {
//               const parsedData = JSON.parse(rawData);
//               console.log(parsedData);
//               file.botPassword = parsedData.access_token;
//               file.twitchRefreshToken = parsedData.refresh_token;
//               const fileName = "./config.json";

//               fs.writeFile(
//                 fileName,
//                 JSON.stringify(file),
//                 function writeJSON(err) {
//                   if (err) return console.log(err);
//                   console.log(JSON.stringify(file, null, 2));
//                   console.log("writing to " + fileName);
//                 }
//               );
//             } catch (e) {
//               console.error(e.message);
//             }
//           });
//         });

//         req.on("error", (e) => {
//           console.error(`Got error: ${e.message}`);
//         });

//         req.write(data);
//         req.end();
//       }

//       response.setEncoding("utf8");
//       let rawData = "";
//       response.on("data", (chunk) => {
//         rawData += chunk;
//       });
//       response.on("end", () => {
//         try {
//           const parsedData = JSON.parse(rawData);
//           console.log(parsedData);
//         } catch (e) {
//           console.error(e.message);
//         }
//       });
//     })
//     .on("error", (e) => {
//       console.error(`Got error: ${e.message}`);
//     });
// });

twitchClient.on("connected", (address, port) => {
  console.log(`* Connected to ${address}:${port}`);
});

client.twitchClient = twitchClient;

// Log in to Discord with your client's token
client.login(token);

// function delay(time) {
//   return new Promise((resolve) => setTimeout(resolve, time));
// }