/*
 * Popcorn Time Remote control uses socket.io to manage
 * communications between the mobile app and
 * the desktop popcorn-time app running
 */

try {

	var os=require('os');
	var localname = os.hostname();
	console.log("local machine name: " +localname);

	var ifaces=os.networkInterfaces();

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

		this._movie = {};
		this._view  = "control";

		this.showControl = function() {
			this._view = "control";
			io.sockets.emit("show control");
		}

		this.setMovie = function(movie) {
			this._movie = movie;		
		}

		this.getView = function() {
			return this._view;
		}

		this.showMovieDetail = function(){
			this._view = "detail";
			io.sockets.emit("show movie detail", this._movie);
		}

		this.showDownloading = function() {
			this._view = "downloading";
			io.sockets.emit("show downloading", this._movie);
		}

		this.showPlaying = function() {
			this._view = "playing";
			io.sockets.emit("show playing", this._movie);
		}
		
		this.startStreaming = function() {
			$(".movie-btn.watch").trigger("click");
		}

		this.cancelStreaming = function() {
			$(".loading-cancel").trigger("click");
		}

		this.triggerKeyPress = function(key) {
			var el = document.getElementsByTagName("body");
				  el = el[0];
			if(document.createEventObject){
				var eventObj = document.createEventObject();
				eventObj.keyCode = key;
				el.fireEvent("onkeydown", eventObj);   
			} else if(document.createEvent)	{
				var eventObj = document.createEvent("Events");
				eventObj.initEvent("keydown", true, true);
				eventObj.which = key;
				el.dispatchEvent(eventObj);
			} 
		}

		this.moveLeft = function() {
			this.triggerKeyPress(37);
		}

		this.moveRight = function() {
			this.triggerKeyPress(39);
		}

		this.moveUp = function() {
			this.triggerKeyPress(38);
		}

		this.moveDown = function() {
			this.triggerKeyPress(40);
		}

		this.enter = function() {
			this.triggerKeyPress(13);
		}

		this.esc = function() {
			this.triggerKeyPress(27);
		}

		this.play = function() {
			try { videojs("video_player").play(); }catch(e) { console.log(e);	}
		}

		this.pause = function() {
			try { videojs("video_player").pause(); }catch(e) { console.log(e); }
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
			try { videojs("video_player").muted( videojs("video_player").muted() ? false : true ); }catch(e){ console.log(e); }
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

		socket.emit("my name is", {name:localname});
		switch(remotecontrol.getView()){
			case "detail": remotecontrol.showMovieDetail(); break;
		  case "downloading" : remotecontrol.showDownloading(); break;
		  case "playing" : remotecontrol.showPlaying(); break;
			default: remotecontrol.showControl(); break;
		}

		socket.on("start streaming", function(){
			remotecontrol.startStreaming();
		});

		socket.on("cancel streaming", function(){
			remotecontrol.cancelStreaming();
		});

		socket.on("move left", function(){
			remotecontrol.moveLeft();
		});

		socket.on("move up", function(){
			remotecontrol.moveUp();
		});

		socket.on("move right", function(){
			remotecontrol.moveRight();
		});

		socket.on("move down", function(){
			remotecontrol.moveDown();
		});

		socket.on("press enter", function(){
			remotecontrol.enter();
		});

		socket.on("press esc", function() {
			remotecontrol.esc();
		});

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
