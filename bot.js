const Eris = require("eris");
const createClient = require("webdav");
const fs = require('fs');
const request = require('superagent');
const config = require('./config.json');

var bot = new Eris.CommandClient(config.BOT_TOKEN, {}, {
    description: "A test bot made with Eris",
    owner: "somebody",
    prefix: "o."
});

var occlient = createClient(
	config.OWNCLOUD,
	config.OCUSER,
	config.OCPASS
);

bot.on("ready", () => {
  console.log("Ready!");
});

bot.registerCommand("ping", "Pong!", { // Make a ping command
// Responds with "Pong!" when someone says "!ping"
    description: "Pong!",
    fullDescription: "This command could be used to check if the bot is up. Or entertainment when you're bored."
});

const listCommand = bot.registerCommand("list", async (msg, args) => {
	//lists the contents of the directory in the path
    let files = await occlient.getDirectoryContents(args);
	return '```'.concat(files.map(f => f.filename).join("\n"),'```');
});

const fileCommand = bot.registerCommand("file", async (msg, args) => {

	let response = await request.get(msg.attachments[0].url);
	path = '/'
	let result = await occlient.putFileContents(path.concat(msg.attachments[0].filename), response.body, {format:"binary"});
	return result.statusText;

});

const mkdirCommand = bot.registerCommand("mkdir", async (msg, args) => {
	//make a directory
	if (/^[a-zA-Z0-9-_\/ ]*$/.test(args) === false) {
		return "Path contains invalid characters.";
	}

	let result = await occlient.createDirectory(args);

	return result.statusText;
});



bot.connect();