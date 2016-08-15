var exec = require('child_process').exec;
exec('tasklist', function(err, stdout, stderr) {
  // stdout is a string containing the output of the command.
  // parse it and look for the apache and mysql processes.
});

http://stackoverflow.com/questions/16386371/get-the-mac-address-of-the-current-machine-with-node-js-using-getmac