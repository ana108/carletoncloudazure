var fs = require('fs');
var fileList = [];
var users = [];
var size = {};
var processes = [];
var util = require('util');
function getAllProcesses(){
 var platformPath;
 var operatingSystem = basicInfo().os;
 if(operatingSystem.indexOf('win32') > -1){
	platformPath = 'C://';
 }
 else{
	platformPath = '/proc';
 }
 
 fs.readdirSync(platformPath).forEach(function (name) { //__dirname
	var processFile = {};
	processFile.name = name;
	processFile.subFiles = [];
	fileList.push(processFile);
 });
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
function getAllUsers(){
	var exec = require('child_process').exec;
	//var myInfo = 'awk -F: \'($3 >= 1000) {printf \"%s:%s\\n\",$1,$3}\' /etc/passwd';
	var myInfo = 'awk -F: \'($3 >= 1000 && $3 < 65534) {printf \"%s:%s:%s\\n\",$1,$3,$6}\' /etc/passwd';
	exec(myInfo, function(err, stdout, stderr) {
		if(err){
			console.log("Err: " + err);
		}
		else{
			var stuff = stdout.split("\n"); 
			stuff.pop();
			for(var i = 0; i < stuff.length; i++){
			var user = {};
			var s = stuff[i].split(':');
			user.username = s[0];
			user.uid = s[1];
			user.home = s[2];
			console.log("The home directory of user: ");
			console.log("First: " + s[0]);
			console.log("Second: " + s[1]);
			console.log("Third: " + s[2]);
			var stringReturned = util.inspect(fs.statSync(user.home));
			var index = stringReturned.lastIndexOf(': ');
			user.dateCreated = stringReturned.slice(index+1, stringReturned.length-1);
			users.push(user);
			}
			if(stderr){
				console.log("CERR: "+ stderr);
				}
			}
			});
}
function copyContents(){
var original = '/var/log/auth.log';
var to = '/var/lib/openshift/573c8fb50c1e66fe1f000124/app-root/runtime/repo/openShiftCloud';
var command = 'cp -R ' + original + ' ' + to;
var exec = require('child_process').exec;
	exec(command, function(err, stdout, stderr) {
		if(err){
			console.log("Error with Copying directory " + err);
		}
		else{
			console.log(stdout);
		}
		if(stderr){
			console.log("CERR: "+ stderr);
			}
			});
}
function makeEmptyDir(){
var location = '/var/lib/stacyDir';
fs.mkdir(location, function(err){
	if(err)
	{
		console.log("MkDir Err: " + err);
	}
});
}
function getProcessByUser(){
	var exec = require('child_process').exec;
	var myInfo = 'ps a F';
	myInfo = 'top -n 1 -b';
	myInfo = 'rusers -l';
	myInfo = 'last -f /var/log/wtmp';
	myInfo = 'lsof -u 5868';
	exec(myInfo, function(err, stdout, stderr) {
		if(err){
			console.log("Process By User Err: " + err);
		}
		else{
			var rawData = stdout.split('\n');
			rawData.pop();
			for(var s = 0; s < rawData.length; s++){
				/*var tempArray = rawData[s].split(" ");
				tempArray.pop();
				var realVar = {};
				realVar.*/
				processes.push(rawData[s]);
			}
			size.num = processes.length;
		}
		if(stderr){
			console.log("process by user ERR: "+ stderr);
			}
			});
}
module.exports = {
  getUsers: getAllUsers,
  users: users,
  getProcessByUser: getProcessByUser,
  numProcess: size,
  copyContents: copyContents,
  processes:processes,
  makeEmptyDir: makeEmptyDir
}