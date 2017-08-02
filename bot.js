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

var path = "/";

bot.on("ready", () => {
  console.log("Ready!");
});

bot.registerCommand("ping", "Pong!", { // Make a ping command
	// Responds with "Pong!" when someone says "!ping"
    description: "Pong!",
    fullDescription: "This command could be used to check if the bot is up. Or entertainment when you're bored."
});

const pwdCommand = bot.registerCommand("pwd", path, {
    description: "Prints the current working directory",
    fullDescription: "Prints the current working directory"	
});

const cdCommand = bot.registerCommand("cd", (msg, args) => {
	path = path.concat(args.join(""));
	return path;
});


const listCommand = bot.registerCommand("list", async (msg, args) => {
	//lists the contents of the directory in the path
    let files = await occlient.getDirectoryContents(path);
	return '```'.concat(files.map(f => f.filename).join("\n"),'```');
}, {
	description: "Lists files in a directory",
    fullDescription: "This command lists the files in a directory the directory can be provided in args"
});

const fupCommand = bot.registerCommand("fup", async (msg, args) => {
	//upload a file
	let response = await request.get(msg.attachments[0].url);
	let result = await occlient.putFileContents(path.concat(msg.attachments[0].filename), response.body, {format:"binary"});
	return result.statusText;
}, {
	description: "Upload a file to the current path",
    fullDescription: "This command uploads a file to the current path"
});

const mkdirCommand = bot.registerCommand("mkdir", async (msg, args) => {
	//make a directory
	if (/^[a-zA-Z0-9-_\/ ]*$/.test(args) === false) {
		return "Path contains invalid characters.";
	}

	let result = await occlient.createDirectory(args);
	return result.statusText;
}, {
	description: "Creates a new directory",
    fullDescription: "This command creates a new directory on the current path"
});

const rmCommand = bot.registerCommand("rm", async (msg, args) => {
	//remove a file
	let response = await occlient.deleteFile(args);
	return response.statusText;
});

const mvCommand = bot.registerCommand("mv", async (msg, args) => {
	//move a file from one location to another
	paths = args.join(" ").split(" to ");
	if (paths[0].substring(paths[0].length-4) != paths[1].substring(paths[1].length-4)) {
		return "File extensions does not match";
	}
	let response = await occlient.moveFile(paths[0], paths[1]);
	return response.statusText;
});

const stat = bot.registerCommand("stat", async (msg, args) => {
	//get stats on a file
	let response = await occlient.stat(args.join(" "));
	var msg = '```json\n'.concat(JSON.stringify(response, undefined, 4), '```');
	return msg;
});

const fdown = bot.registerCommand("fdown", async (msg, args) => {
	var temp = args.join(" ").split('/');
	var fname = temp[temp.length-1];

	occlient.getFileContents(args.join()).then(function(data) {
        fs.writeFileSync('./'.concat(fname), data);
    });

    console.log("reached");

/*	fs.readFile('./'.concat(fname), (err, data) => {
		let sent = await bot.createMessage(msg.channel.id, fname, data);
	}); */
	
	data = fs.readFileSync('./'.concat(fname));
	let sent = await bot.createMessage(msg.channel.id, fname, data);
	
	return "logged";
});

bot.connect();