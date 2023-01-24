const { glob } = require("glob")
const { promisify } = require("util")
const proGlob = promisify(glob)
const path = require("node:path");
const fs = require("node:fs");
const https = require("https");
const querystring = require("querystring");

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
      //Checkes for a command.subCommand
      if(command.subCommand === true) return client.subcommands.set(command.subCommand, command)

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

function checkTwitchToken(client) {
  return new Promise((resolve, reject) => {
    // Replace YOUR_ACCESS_TOKEN with the actual access token
    const access_token = client.config.twitch.accessToken;

    const getOptions = {
      hostname: "id.twitch.tv",
      path: "/oauth2/validate",
      headers: {
        Authorization: "OAuth " + client.config.twitch.accessToken,
        "Client-ID": client.config.twitch.clientId,
      },
    };

    https
      .get(getOptions, async (response) => {
        const { statusCode } = response;
        const contentType = response.headers["content-type"];

        let error;
        if (statusCode !== 200) {
          error = new Error("Request Failed.\n" + `Status Code: ${statusCode}`);
          console.log("There was an error... Creating a new access token...");
          // Create a post request to get a new access token
          const client_id = client.config.twitch.clientId;
          const client_secret = client.config.twitch.clientSecret;
          const refresh_token = client.config.twitch.refreshToken;

          const data = querystring.stringify({
            client_id: client_id,
            client_secret: client_secret,
            grant_type: "refresh_token",
            refresh_token: refresh_token,
          });

          const options = {
            hostname: "id.twitch.tv",
            path: "/oauth2/token",
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "Content-Length": data.length,
            },
          };

          const req = https.request(options, (res) => {
            const { statusCode } = res;
            const contentType = res.headers["content-type"];

            let error;
            if (statusCode !== 200) {
              error = new Error(
                "Request Failed.\n" + `Status Code: ${statusCode}`
              );
            }

            // Prints POST response to console and writes new codes to config.json
            res.setEncoding("utf8");
            let rawData = "";
            res.on("data", (chunk) => {
              rawData += chunk;
            });
            res.on("end", () => {
              try {
                const parsedData = JSON.parse(rawData);
                console.log(parsedData);
                file.botPassword = parsedData.access_token;
                file.twitchRefreshToken = parsedData.refresh_token;
                const fileName = "./config.json";

                fs.writeFile(
                  fileName,
                  JSON.stringify(file),
                  function writeJSON(err) {
                    if (err) return console.log(err);
                    console.log(JSON.stringify(file, null, 2));
                    console.log("writing to " + fileName);
                  }
                );
                resolve(parsedData.access_token);
              } catch (e) {
                console.error(e.message);
              }
            });
          });

          req.on("error", (e) => {
            console.error(`Got error: ${e.message}`);
          });

          req.write(data);
          req.end();
        } else {
          resolve(access_token);
        }

        // Prints GET response to console
        response.setEncoding("utf8");
        let rawData = "";
        response.on("data", (chunk) => {
          rawData += chunk;
        });
        response.on("end", () => {
          try {
            const parsedData = JSON.parse(rawData);
            console.log(parsedData);
          } catch (e) {
            console.error(e.message);
          }
        });
      })
      .on("error", (e) => {
        console.error(`Got error: ${e.message}`);
      });
  });
}
function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = { loadCommands, loadEvents, gettime, checkTwitchToken, delay }
