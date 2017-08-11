const Eris = require("eris");											//Discord Bot API
const fs = require('fs');												//File System commands
const request = require('superagent');									//HTTP request library
const config = require('./config.json');								//Secrets for authenticating bot
const builder = require('./builder.js');								//Helper class for queries and 
const baseurl = "https://graph.microsoft.com/v1.0/users/me/drive/root";	//Base URL for OneDrive requests

var relpath = "/"
/*
Useful example from docs
var root = "https://api.onedrive.com/v1.0/drive/root:";
var path = "/Documents/My Files/#nine.docx";
var url = root + escape(path);
*/

//Initialize the Discord bot
var bot = new Eris.CommandClient(config.BOT_TOKEN, {}, {
    description: "Integrate One Drive with Discord",
    owner: "PlayerVMachine#6223",
    prefix: "o."
});


//Make a GET Request to OneDrive
//Example: queryOD(relpath + "children", builder.query('basic')).then( res => {console.log(res);});
async function queryOD (path, query) {
	let response = await request.get(baseurl + path).set("Authorization", config.OD_TOKEN).query({select: query});
	console.log(response.statusCode);
	return response.body.value;
}

async function makeODDir (path, fname) {
	let response = await request.post("https://graph.microsoft.com/v1.0/users/me/drive/root:Documents/children").set("content-type", "application/json").send('{"name":fname,"folder":"{ }"}');
	console.log(response.statusCode);
	return response.status;
}

//queryOD(relpath + "children", builder.query('basic')).then( res => {console.log(res);});
makeODDir(relpath + "children", "testfoleder").then(res => {console.log(res)});