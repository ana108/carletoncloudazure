var express = require('express');
var mySystem = require('./systemInformation.js');
var info = require('./processes.js');
var router = express.Router();
var currentDir =  mySystem.workingDir();
var multer  = require('multer')
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })
var systemStats = {};
var httpd = {};
function index(req, res) {
	console.log("Starting index call");
	var pageComplete = 0;
	mySystem.basic(function(data){
		var tempObject = data;
		systemStats.host = tempObject.host;
		systemStats.os = tempObject.os;
		systemStats.currentDirectory = tempObject.currentDirectory;
		systemStats.ip = tempObject.ip;
		//systemLogs();
		sendPage();
	});
	systemStats.date = new Date();
	var home = "D://"
	systemStats.listFiles = mySystem.readContentsHome(home);
	var homeUsers = "D://inetpub/logs/"; //"D://Users/";
	systemStats.usr = mySystem.readContentsHome(homeUsers);
	var stuff = "wmic process list";
	var procFind = function(){
		mySystem.executeCmd(stuff,"\n", function(thisData){
								httpd.p = thisData;	
								environment();// had to link it because otherwise the two calls interfere with each other.
	});
							  }
	procFind();
	var environment = function(){
		var command = "set"; 
		mySystem.executeCmd(command,"\n",function(myData){
								     systemStats.env = myData;
									 services();
												});	
	}
	
	var services = function(){
		var command = "sc queryex type= service state= all"; 
		mySystem.executeCmd(command,"\n",function(myData){
								     systemStats.services = myData;
									 listPorts();
												});	
	}
	function listPorts(){
		var command = "netstat -a";
		mySystem.executeCmd(command,"\n",function(myData){
								     systemStats.ports = myData;
									 if(myData.length == 0){
										systemStats.ports =[];
										systemStats.ports.push("Nothing returned");
									 }
									 sendPage();
												});	
	}
	var systemLogs = function(){
		var data = "";
		var thePath = "/var/auth.log";
		mySystem.readBySize(thePath, function(err, bytesRead, buffer){
			if(err){
				systemStats.sysLogs = "could not read file " + thePath;
			}
			else{
				data = buffer;
				if(data == false){
					data = "permission denied";
				}
				systemStats.sysLogs = data;
			}
			sendPage();
		})
	}
	
	function sendPage(){
		pageComplete += 1;
		if(pageComplete == 2){
			res.render('index', { title: 'Security on the Cloud', info: systemStats, httpd: httpd});
		}
	}
}
function users(req, res) {
	
	if(info.users.length == 0){
		info.getUsers();
	}
	var sending = "<table><tr><th>Username</th><th>UserID</th><th>Date Created</th></tr>";
	for(var i = 0; i < info.users.length; i++){
		sending += "<tr><td>"
		sending += info.users[i].username + "</td><td>" + info.users[i].uid + "</td><td>" + info.users[i].dateCreated + "</td>";
		sending+="</tr>";
	}
	
	sending += "</table>"
	res.send(sending);
    
}

router.get('/', index);
router.get('/users', users);
module.exports = router;
