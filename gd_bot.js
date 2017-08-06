const Eris = require("eris");
const fs = require('fs');
const request = require('superagent');
const config = require('./config.json');
const readline = require('readline');
const google = require('googleapis');
const googleAuth = require('google-auth-library');

var SCOPES = ['https://www.googleapis.com/auth/drive'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
	process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';

//------------Auth stuff for google drive
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
 function authorize(credentials, callback, msg) {
 	var clientSecret = credentials.installed.client_secret;
 	var clientId = credentials.installed.client_id;
 	var redirectUrl = credentials.installed.redirect_uris[0];
 	var auth = new googleAuth();
 	var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
  	if (err) {
  		getNewToken(oauth2Client, callback);
  	} else {
  		oauth2Client.credentials = JSON.parse(token);
  		callback(oauth2Client, msg);
  	}
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
 function getNewToken(oauth2Client, callback) {
 	var authUrl = oauth2Client.generateAuthUrl({
 		access_type: 'offline',
 		scope: SCOPES
 	});
 	console.log('Authorize this app by visiting this url: ', authUrl);
 	var rl = readline.createInterface({
 		input: process.stdin,
 		output: process.stdout
 	});
 	rl.question('Enter the code from that page here: ', function(code) {
 		rl.close();
 		oauth2Client.getToken(code, function(err, token) {
 			if (err) {
 				console.log('Error while trying to retrieve access token', err);
 				return;
 			}
 			oauth2Client.credentials = token;
 			storeToken(token);
 			callback(oauth2Client);
 		});
 	});
 }

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
 function storeToken(token) {
 	try {
 		fs.mkdirSync(TOKEN_DIR);
 	} catch (err) {
 		if (err.code != 'EEXIST') {
 			throw err;
 		}
 	}
 	fs.writeFile(TOKEN_PATH, JSON.stringify(token));
 	console.log('Token stored to ' + TOKEN_PATH);
 }
//-----------end Auth stuff for google drive

var bot = new Eris.CommandClient(config.BOT_TOKEN, {}, {
    description: "A test bot made with Eris",
    owner: "somebody",
    prefix: "g."
});

bot.on("ready", () => {
  console.log("Ready!");
});

const lsCommand = bot.registerCommand ("ls", (msg, args) => {
	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
		if (err) {
			return ('Error loading client secret file: ' + err);
		}
		authorize(JSON.parse(content), lsfile, msg);
	});
});

function lsfile (auth, msg) {
	var service = google.drive('v3');
 	service.files.list({
 		auth: auth,
 		pageSize: 10,
 		fields: "nextPageToken, files(id, name)"
 	}, function(err, response) {
 		if (err) {
 			console.log('The API returned an error: ' + err);
 			return;
 		}
 		var files = response.files;
 		if (files.length == 0) {
 			console.log('No files found.');
 		} else {
 			var list = '```\nFiles:\n';
 			for (var i = 0; i < files.length; i++) {
 				var file = files[i];
 				list += file.name;
 				list += ' ';
 				list += file.id;
 				list +='\n';
 			}
 			list += '```'
 			bot.createMessage(msg.channel.id, list);
 		}
 	});
}

//=======================

const upCommand = bot.registerCommand ("up", (msg, args) => {
	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
		if (err) {
			return ('Error loading client secret file: ' + err);
		}
		authorize(JSON.parse(content), upfile, msg);
	});
});


async function upfile (auth, msg) {
	let response = await request.get(msg.attachments[0].url);
	var drive = google.drive('v3');
	var fileMetadata = {
		'name': msg.attachments[0].filename
	};
	var media = {
		body: response.body
	};
	drive.files.create({
		auth: auth,
		multipart: media,
		fields: 'id, name'
	}, function(err, file) {
		if(err) {
    // Handle error
    console.log(err);
} else {
	console.log('File Id: ', file.id);
	bot.createMessage(msg.channel.id, file.name);
}
});
}

bot.connect();