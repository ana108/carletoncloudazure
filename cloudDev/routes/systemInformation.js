var os = require('os');
var fs = require('fs');
var fsa = require('fs-extra');
var path = require('path');
var fileList = [];
var systemInfo = {};
var ps = require('ps-node');
//var processes = [];
var data = [];
var ip = require('externalip');
function basicInfo(thisCallback){
			systemInfo.host = os.hostname();
			systemInfo.os = os.platform();
			systemInfo.currentDirectory = path.resolve(__dirname);
			ip(function (err, eip) {
				systemInfo.ip = eip;
				thisCallback(systemInfo);
				});
		
		
}
function copyContents(){
var original = '/etc/httpd/conf/httpd.conf';
var to = '/var/lib/openshift/573c8fb50c1e66fe1f000124/app-root/runtime/repo/openShiftCloud/routes';
try {
  fsa.copySync(original, to);
  console.log("success!")
} catch (err) {
  console.error(err)
}
}
function copyContentsTwo(){
	var original = '/etc/httpd';
	var to = '/var/lib/openshift/573c8fb50c1e66fe1f000124/app-root/runtime/repo/openShiftCloud/routes';
	var command = 'sudo cp -R --no-preserve=mode,ownership ' + original + ' ' + to;
	var exec = require('child_process').exec;
	exec(command, function(err, stdout, stderr) {
		if(err){
			console.log("Error with Copying directory " + err);
		}
		else{
			//console.log(stdout);
		}
		if(stderr){
			console.log("CERR: "+ stderr);
			}
			});
}
function readContentsHome(){
	var home = "/var/lib/openshift/573c8fb50c1e66fe1f000124/app-root/runtime/repo/openShiftCloud/routes/httpd";
	home = "/var/www/html";
	var listItems=[];
	fs.readdirSync(home).forEach(function (name) { //__dirname
		listItems.push(name);
	});
	return listItems;
	 }
 var executeCmd = function(info,deliminator, callback){
	var exec = require('child_process').exec;
	var myInfo = info;
	data = [];
	try{
		exec(myInfo, function(err, stdout, stderr) 
			 {
				if(err){
					var finding = err.message.split(deliminator); 
					if(finding.length > 1){
						finding.pop();
					}
					if(finding.length == 0){
						finding.push("Nothing found");
					}
					for(var a = 0; a < finding.length; a++)
					{
						if(finding[a].indexOf('Permission denied') <= 0){
							if(finding[a].indexOf('No such file or directory') <= 0){
								data.push(finding[a]);												}
						}
					}
					callback(data);
					   }
				else{
					var stuff = stdout.split(deliminator); 
					if(stuff.length > 1){
						stuff.pop();
					}
					if(stuff.length == 0){
						data.push("Nothing found");
					}
					
					for(var a = 0; a < stuff.length; a++)
					{
						if(stuff[a].indexOf('Permission denied') <= 0){
							if(stuff[a].indexOf('No such file or directory') <= 0){
								data.push(stuff[a]);
							}
						}
						
					}
					callback(data);
				  }
				if(stderr){
					data.push(stderr);
					callback(data);
					  }
			 });
	}catch(e){
		data.push("ERR: ");
		callback(data);
	}
							}
//curr directory:
// /var/lib/openshift/573c8fb50c1e66fe1f000124/app-root/runtime/repo/openShiftCloud/routes
function currentDirectory(){
	return path.resolve(__dirname);
}
/*
This reads all the process files.
*/
function readDomain(location){
	var contents = accessRead(location);
	if(!accessRead(location)){
		contents = "access is not granted to read " + location;
	}
	return contents;
}
function procRead(){
	 var platformPath;
	 var operatingSystem = systemInfo.os;
	 if(operatingSystem.indexOf('win32') > -1){
		platformPath = 'C://';
	 }
	 else{
		platformPath = '/proc';
	 }
	 fileList = [];
	 fs.readdirSync(platformPath).forEach(function (name) { //__dirname
		var processFile = {};
		processFile.name = name;
		processFile.subFiles = [];
		fileList.push(processFile);
	 });
	 return fileList;
}
/* 
This attempts to read inside the process folders. And fails. Can be removed
*/
function processRead(){
	var platformPath;
	 var operatingSystem = systemInfo.os;
	if(operatingSystem.indexOf('win32') > -1){
		platformPath = 'C://';
	}
	else{
		platformPath = '/proc';
		}
	var subdir = platformPath;
	retrieveProcessInfo();
	for(var i = 0; i < fileList.length-1; i++){
		var newPath = subdir + fileList[i].name;
		if(accessGranted(newPath) == true){
			var result = fs.lstatSync(newPath); //newPath
			var subFileList = [];
			if(result.isDirectory() == true){
				var myArray = [];
				myArray = fs.readdirSync(newPath); 
				myArray.forEach(function(fileName){
										subFileList.push(fileName);
										
												  });
				fileList[i].subFiles = subFileList;
											} //isDirectory
			else{
					subFileList.push(newPath);
					fileList[i].subFiles = subFileList; 
				}
								   }//if accessGranted
											 }//for
} //function processRead
function accessGranted(thePath){
	try{
		fs.lstatSync(thePath); 
		}
	catch(e){
		return false;
		}
		return true;
}
function accessRead(thePath){
	var val = false;
	try{
		val = fs.readFileSync(location, "utf8"); 
		}
	catch(e){
		val = false;
		}
	return val;
}
function readBySize(thePath, callback){
	var val = false;
	try{
		fs.read(thePath, val, 50,0,callback); 
		}
	catch(e){
		val = false;
		callback("", 0, val);
		}
	
}
function retrieveProcessInfo(){
	var listPID = [];
	var numberExp = new RegExp("[0-9]");
	for(var k = 0; k < fileList.length-1; k++){
		if(numberExp.test(fileList[k].name)){
			listPID.push(fileList[k].name);
		}
	}
}

function getManualFilteredProcess(){
		var exec = require('child_process').exec;
		var myInfo = 'ps a -ef|grep node';
		myInfo = 'pgrep node';
		exec(myInfo, function(err, stdout, stderr) {
			if(err){
				console.log(err);
			}else{
				var results = stdout;
				results = results.split('\n');
				for(var i = 0; i < results.length-1; i++){
					var ex = require('child_process').exec;
					var info = 'ps -p ' + results[i] + ' -F';
					exec(info, function(err, stdout, stderr)
					{
						if(err){
							console.log(err);
						}
						else{
						}
					}
					);
				}
				if(stderr){
					console.log(stderr);
				}
			}
			// stdout is a string containing the output of the command.
														});
	}
function straightUpProcess(){
		var exec = require('child_process').exec;
		var myInfo = 'ps -p 12663 ' + ' -F'; //process.pid
		//myInfo = 'pwdx ' + 12663;
		myInfo = 'ps -p 12681';
		exec(myInfo, function(err, stdout, stderr) {
			if(err){
				console.log("Err call");
				console.log(err);
			}else{
			
				if(stderr){
					console.log(stderr);
				}
			}
			// stdout is a string containing the output of the command.
														});
	}
function readDirectory(dirPath){
	var results = [];
	fs.readdirSync(dirPath).forEach(function (name) { //__dirname
		results.push(name);
														 });
	return results;
}

function processesByUser(){
	
		var exec = require('child_process').exec;
		var myInfo = 'ps -u 6692'; //
		exec(myInfo, function(err, stdout, stderr) {
			if(err){
				console.log("get processes by user: " + err);
			}else{
				//console.log(stdout);
				if(stderr){
					console.log(stderr);
				}
			}
			// stdout is a string containing the output of the command.
														});
}
module.exports = {
  basic: basicInfo,
  proc: procRead,
  workingDir: currentDirectory,
  fList: fileList,
  processRead: processRead,
  //processList: processes,
  nodeProcesses: getManualFilteredProcess,
  readDirectory: readDirectory,
  user: processesByUser,
  executeCmd: executeCmd,
  readDomain: readDomain,
  readContentsHome: readContentsHome,
  copyContentsTwo: copyContentsTwo,
  data: data,
  accessRead:accessRead,
  readBySize:readBySize
}