/*
 * Remote controller uses socket.io to manage
 * communications between the mobile app and
 * the desktop popcorn-time app running
 */

try {

	var os=require('os');
	var localname = os.hostname();
	console.log("local machine name: " +localname);

	var ifaces=os.networkInterfaces();
	// local IP's logs
	for (var dev in ifaces) {
		var alias=0;
		ifaces[dev].forEach(function(details){
			if(details.family=='IPv4') {
				if(dev.match(/^en/)) {
					intra = details.address;
				}
			}
		});
	}
	var rcapp  = require('express')();
	var rchttp = require('http').Server(rcapp);

	rcapp.get('', function(req, res){
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end("It's popcorn time remote control");
	});

	rcapp.get('/', function(req, res){
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end("It's popcorn time remote control");
	});

	var io = require('socket.io')(rchttp);
	io.on('connection', function(socket){

		socket.emit("jalou", {name:localname});

		socket.on("play", function(){
			try { 
				videojs("video_player").play(); 
			}catch(e) { 
				socket.emit("play error", {e:e}); 
			}
		});

		socket.on("pause", function(){
			try { 
				videojs("video_player").pause();
				var thePoster = videojs("video_player").poster();
				console.log(thePoster); 

			}catch(e) { 
				console.log(e);
				socket.emit("pause error", {e:e}); 
			}
		});

		socket.on("volume up", function(){
			try { 
				var howLoudIsIt = videojs("video_player").volume(); 
				howLoudIsIt  = howLoudIsIt + 0.1 > 1 ? 1 : howLoudIsIt + 0.1;
				videojs("video_player").volume(howLoudIsIt);
			} catch(e) { console.log(e); }
		});

		socket.on("volume down", function(){
			try { 
				var howLoudIsIt = videojs("video_player").volume(); 
				howLoudIsIt  = howLoudIsIt - 0.1 < 0 ? 0 : howLoudIsIt - 0.1;
				videojs("video_player").volume(howLoudIsIt);
			} catch(e) { console.log(e); }
		});

		socket.on("fullscreen", function(){
			try {
				var vjs = videojs("video_player");
				if(vjs.isFullscreen()){ 
					vjs.exitFullscreen();
				}else{ 
					vjs.requestFullscreen();
				}
			}catch(e){
				console.log(e);
			}	
		});

		socket.on("mute", function(){
			try {
				videojs("video_player").muted( videojs("video_player").muted() ? false : true );
			}catch(e){
				console.log(e);
			}
		});

		socket.on("get poster", function(){
			try {
				var thePoster = videojs("video_player").poster();
			}catch(e) { console.log(e); }		
		});

	});

	rchttp.listen(8006, function(){
		console.log(intra +":8006 server listening to socket.io");
	});

}catch(e){ 
	console.log("rm error");
	console.log(e); 
}
