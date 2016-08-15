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
	var pageComplete = 0;
	mySystem.basic(function(data){
		var tempObject = data;
		systemStats.host = tempObject.host;
		systemStats.os = tempObject.os;
		systemStats.currentDirectory = tempObject.currentDirectory;
		systemStats.ip = tempObject.ip;
		systemStats.ports = listPorts();
		systemLogs();
		sendPage();
	});
	systemStats.date = new Date();
	//systemStats.files = mySystem.readContentsHome();
	//sendPage();	
	//mySystem.proc();
	//mySystem.processRead();
	var stuffBSD = "ps -e -o pid, uname, comm";
	var stuff = "ps -A -o pid,uname,uid,comm";
	systemStats.listFiles = mySystem.proc();
	var processes = function(){mySystem.executeCmd(stuff,"\n", function(thisData){
								//systemStats.p = thisData;
								if(thisData.indexOf('ERR') > 0){
									
								}
								httpd.p = thisData;
								getHTTPD();// had to link it because otherwise the two calls interfere with each other.
	});
							  }
	processes();
	//systemStats.processInfo = mySystem.processList;
	var getHTTPD = function(){
		var otherStuff = "httpd -V"; //clear
		mySystem.executeCmd(otherStuff,"\n", function(myData){
								     systemStats.httpd = myData;
									 systemStats.confData = mySystem.readDomain(getLocationConfFile());
									 whoIsLoggedIn();
												});
	}
	var whoIsLoggedIn = function(){
		var command = "who -H";//"last";
		mySystem.executeCmd(command,"\n", function(myData){
								     systemStats.openFile = myData;
									 whoWasLoggedIn();
												});
								  }
	var whoWasLoggedIn = function(){
		var command = "last -d"; //returns last users including remote users
		mySystem.executeCmd(command,"\n", function(myData){
								     systemStats.remoteLogin = myData;
									 getUmask();
												});
								  }	
	var getUmask = function(){
		var otherStuff = "umask";
		mySystem.executeCmd(otherStuff,"\n",function(myData){
								     systemStats.umask = myData;
									 selinux();
												});			
							 }
	function getLocationConfFile(){
		var path = "";
		var flag = 0;
		for(var i = 0; i < systemStats.httpd.length; i++){
			if(systemStats.httpd[i].indexOf('HTTPD_ROOT') > 0){
				var result = systemStats.httpd[i].split('=')[1].replace(/"/g, '');
				flag = flag+1;
			}
			if(systemStats.httpd[i].indexOf('SERVER_CONFIG_FILE') > 0){
				var resultLoc = systemStats.httpd[i].split('=')[1].replace(/"/g, '');
				flag = flag+1;
			}
			if(flag == 2){
				path = result + '/' + resultLoc;
				break;
			}
		}
		return path;
	}
	var selinux = function(){
		var command = "sestatus"; 
		mySystem.executeCmd(command,"\n",function(myData){
								     systemStats.sestatus = myData;
									 environment();
												});	
	}
	var environment = function(){
		var command = "env"; 
		mySystem.executeCmd(command,"\n",function(myData){
								     systemStats.env = myData;
									 lastlog();
												});	
	}
	
	var lastlog = function(){
		var command = "lastlog"; 
		mySystem.executeCmd(command,"\n",function(myData){
								     systemStats.lastlog = myData;
									 if(myData.length == 0){
										systemStats.lastlog = [];
										systemStats.lastlog.push("Permission denied");
									 }
									 sendPage();
												});	
	}
	
	function listPorts(){
		var ports = mySystem.accessRead('/proc/net/tcp');
		if(ports == false){
			ports = [];
			ports.push("Permission denied to read /proc/net/tcp");
		}
		return ports;
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
		if(pageComplete == 3){
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
    
};

function processes(req, res) {
	var fullProcessInfo = "<ol><li>First row</li>";
	if(info.numProcess.num == null){
		info.getProcessByUser();
	}
	for(var i =0; i < info.processes.length; i++){
		fullProcessInfo += "<li>"+info.processes[i]+"</li>";
	}
	fullProcessInfo += "</ol>";
    res.send(fullProcessInfo);
}
var files = {};
files.list = [];
function unownedFiles(req, res){
	var command = "find / -nogroup -nouser";
	console.log("Calling find functions...");
	if(mySystem.data.length == 0){
	mySystem.executeCmd(command,"\n",function(myData){
									 var temp = [];
									 if(myData.length == 0){
										temp.push("There are no files that do not have an owner.");
										files.list = temp;
									 }else{
										files.list = myData;
									 }
									 console.log("files list retrieved: ");
												});
								 }
	res.render('unownedFiles', { title: 'Security on the Cloud', info: files});
}

router.get('/', index);
router.get('/users', users);
router.get('/processByUser', processes);
router.get('/files', unownedFiles);

module.exports = router;
