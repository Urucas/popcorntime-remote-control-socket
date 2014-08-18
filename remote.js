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

	var remotecontrol = new (function(){
		
		this.showPlayerButtons = function() {
			io.sockets.emit("player created");
		}

		this.hidePlayerButtons = function() {
			io.sockets.emit("player close");
		}

		this.play = function() {
			try { 
				videojs("video_player").play(); 
			}catch(e) { 
				console.log(e);			
			}
		}

		this.pause = function() {
			try { 
				videojs("video_player").pause();
			}catch(e) { 
				console.log(e);
			}
		}

		this.volumeup = function() {
			try { 
				var howLoudIsIt = videojs("video_player").volume(); 
				howLoudIsIt  = howLoudIsIt + 0.1 > 1 ? 1 : howLoudIsIt + 0.1;
				videojs("video_player").volume(howLoudIsIt);
			} catch(e) { 
				console.log(e); 
			}
		}

		this.volumedown = function() {
			try { 
				var howLoudIsIt = videojs("video_player").volume(); 
				howLoudIsIt  = howLoudIsIt - 0.1 < 0 ? 0 : howLoudIsIt - 0.1;
				videojs("video_player").volume(howLoudIsIt);
			} catch(e) { 
				console.log(e); 
			}
		}

		this.mute = function() {
			try {
				videojs("video_player").muted( 
						videojs("video_player").muted() ? false : true 
				);
			}catch(e){
				console.log(e);
			}
		}

		this.fullscreenToggle = function() {
			try {
				var nativeWindow = require('nw.gui').Window.get();
				if(nativeWindow.isFullscreen) {
					nativeWindow.leaveFullscreen();
					nativeWindow.focus();
				}else{
					nativeWindow.enterFullscreen();
					nativeWindow.focus();
				}
			}catch(e){
				alert(e);
			}
		}
	});

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
			remotecontrol.play();
		});

		socket.on("pause", function(){
			remotecontrol.pause();
		});

		socket.on("volume up", function(){
			remotecontrol.volumeup();
		});

		socket.on("volume down", function(){
			remotecontrol.volumedown();
		});

		socket.on("fullscreen", function(){
			remotecontrol.fullscreenToggle();
		});

		socket.on("mute", function(){
			remotecontrol.mute();
		});
	
	});

	rchttp.listen(8006, function(){
		console.log(intra +":8006 server listening to socket.io");
	});

}catch(e){ 
	console.log("rm error");
	console.log(e); 
}
