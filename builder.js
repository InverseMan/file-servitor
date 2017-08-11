//List of prebuilt query strings for Graph API calls
const basic   = "name,parentReference,folder,size";
const dates   = "name,parentReference,folder,createdDateTime,fileSystemInfo,lastModifiedDateTime";
const links   = "name,parentReference,folder,webUrl,@microsoft.graph.downloadUrl";
const authors = "name,parentReference,folder,createdBy,lastModifiedBy";

//functions to be exported so they can be called in the main file to reduce cluttering
module.exports = {
	//returns a query
	query: function (q) {
		if (q === "basic")
			res = basic;
		else if (q === "dates")
			res = dates;
		else if (q === "links")
			res = links;
		else if (q === "authors")
			res = authors;
		else
			res = '';
		return res;
	}

	//
	//name : function (inputs)
};