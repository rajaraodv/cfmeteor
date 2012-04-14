/*
	cloudfoundry helper library
	https://github.com/igo/cloudfoundry
	
	Copyright (c) 2011 by Igor Urmincek

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/

/*
	Updated by Raja Rao DV rajar@vmware.com to automatically load *Ubuntu compiled fibers* module
	& set process.env.MONGO_URL, process.env.HOST, process.env.PORT

*/

exports.cloud = typeof process.env.VCAP_APPLICATION != 'undefined';

process.env.HOST = exports.host = process.env.VCAP_APP_HOST || 'localhost';
process.env.PORT = exports.port = process.env.VCAP_APP_PORT || '3000';

/**
 * 	NOTE: We will keep 'fibersUbuntu' module which is compiled on Ubuntu OS.
 * 	When this script runs in Cloud Foundry, it removes the fibers module shipped w/ Meteor
 *  & renames 'fibersUbuntu' to 'fibers' so that we can use Ubuntu version.
**/
if(exports.cloud) {
	var fs = require('fs');
	try{
		fs.renameSync(__dirname + '/../../fibers', __dirname + '/../../fibersLocal');	
	} catch(e) {
		console.error("local fibers module not found");
	}

	try{
		fs.renameSync(__dirname + '/../fibersUbuntu', __dirname + '/../../fibers');
		console.log("Renamed fibersUbuntu module to fibers module to use in Cloud Foundry");
	} catch(e) {
		console.error("Ubuntu version of fibers module 'fibersUbuntu' not found");
	}	
}

exports.app = function() {
	if (exports.cloud) {
		return JSON.parse(process.env.VCAP_APPLICATION);
	} else {
		return undefined;
	}
}();

exports.services = function() {
	if (exports.cloud) {
		return JSON.parse(process.env.VCAP_SERVICES);
	} else {
		return {};
	}
}();

exports.mongodb = {};
exports.redis = {};
exports.mysql = {};

var item, service, list, i;
for (item in exports.services) {
	if (exports.services.hasOwnProperty(item)) {
		service = item.substring(0, item.indexOf('-'));
		if (!exports[service]) {
			// create if doesn't exist
			exports[service] = {};
		}
		list = exports.services[item];
		for (i = 0; i < list.length; i++) {
			exports[service][i] = exports[service][list[i].name] = list[i];
			exports[service][i]['version'] = exports[service][list[i].name]['version'] = item.substring(item.indexOf('-') + 1);
		}
	}
}
//Automatically sets 1st mongodb service's credentials to process.env.MONGO_URL
function setMongoURLEnv() {
    var mongoUrl;
    //default
    var credentials = {
        "hostname": "localhost",
        "port": 27017,
        "username": "",
        "password": "",
        "name": "",
        "db": "db"
    }
    if (exports.cloud) {
		var service = exports.mongodb[0];
		if(service) {
			credentials = service.credentials;
		}
    }
    if (credentials.username && credentials.password) {
        mongoUrl = "mongodb://" + credentials.username + ":" + credentials.password + "@" + credentials.hostname + ":" + credentials.port + "/" + credentials.db;
    } else {
        mongoUrl = "mongodb://" + credentials.hostname + ":" + credentials.port + "/" + credentials.db;
    }
	process.env.MONGO_URL = mongoUrl;//set first 
	console.log(mongoUrl);
    return mongoUrl;
}

setMongoURLEnv();
