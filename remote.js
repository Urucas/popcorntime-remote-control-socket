/*
 * Remote controller uses socket.io to manage
 * communications between the mobile app and
 * the desktop popcorn-time app running
 */

try {

	var os=require('os');
	var ifaces=os.networkInterfaces();
	// local IP's logs
	for (var dev in ifaces) {
  	var alias=0;
  	ifaces[dev].forEach(function(details){
    	if(details.family=='IPv4') {
				intra = details.address;
  	  }
	  });
		console.log(dev+" "+intra);
	}

	var rcapp  = require('express')();
	var rchttp = require('http').Server(rcapp);
	
	rcapp.get('', function(req, res){
		res.writeHead(200, { 'Content-Type': 'text/html' });
	  res.end("it works");
	});
	
	rcapp.get('/', function(req, res){
		res.writeHead(200, { 'Content-Type': 'text/html' });
	  res.end("it works");
	});

	var io = require('socket.io')(rchttp);
	io.on('connection', function(socket){
		
		socket.on("play", function(){
			console.log("play");
			try { videojs("video_player").play(); }catch(e) { alert(e); }
		});

		socket.on("pause", function(){
			console.log("pause");
			try { videojs("video_player").pause(); }catch(e) { alert(e); }
		});
	});
	
	rchttp.listen(8006, function(){
		console.log("192.168.0.100:8006 server listening to socket.io");
	});
	
}catch(e){ 
	console.log("rm error");
	console.log(e); 
}
