// Import the Express module
var express = require('express');

// Import the 'path' module (packaged with Node.js)
var path = require('path');

// Create a new instance of Express
var app = express();

// Create a simple Express application
// Serve static html, js, css, and image files from the 'public' directory
app.use(express.static(path.join(__dirname,'public')));

// Create a Node.js based http server on port 8080
var server = require('http').createServer(app).listen(process.env.PORT);
console.log("Listening on port " + process.env.PORT + "...");
// Create a Socket.IO server and attach it to the http server
var io = require('socket.io').listen(server);

// Load up p2 physics engine
var p2 = require('p2');

var Lobby = require('lobby.js');
var Player = require('player.js');
// Reduce the logging output of Socket.IO
// io.set('log level',1);

// Maps lobby codes to lobby objects.
var publicLobbies = {};
var privateLobbies = {};

// Maps socket IDs to players
var onlinePlayers = {};

// When a client connects, in here we have the connection: one socket between the server and the one client.
io.on('connection', function (socket) {

    console.log('client connected\t' + socket.id);
	
	socket.emit('connected', { message: "You are connected!" });
	
	/*
		Responses to messages from the client.
	*/
	socket.on('disconnect', function(){
		console.log('client disconnected\t' + socket.id);
		
		if(socket.gameLobby){
			socket.gameLobby.removePlayer(onlinePlayers[socket.id]);
			if(Object.keys(socket.gameLobby.players).length === 0){
				console.log("Removing empty lobby.");
				socket.gameLobby.stop();
				var lobbyCode = socket.gameLobby.lobbyCode;
				
				delete publicLobbies[lobbyCode];
				delete privateLobbies[lobbyCode];
				
				// TODO: similar check when a player leaves lobby to return to main menu.
			}
		}
		
		delete onlinePlayers[socket.id];
	});
	
	/*
		A client is asking to log in.
	*/
	socket.on('clientLogin', function(data){
		var player = new Player(socket, data.playerName);
		onlinePlayers[socket.id] = player;
		socket.emit("loginSuccessful", {name : player.name});
	});
	
	/*
		A client is auto-joining a lobby.
		
		If no lobby is available after waiting a little while, the client will host a new public lobby.
	*/
	socket.on('clientJoinAuto', function(){
		var bestLobby = null;
		for(var code in publicLobbies){
			// TODO: prioritization
			if(bestLobby == null || true){
				bestLobby = publicLobbies[code];
			}
		}
		
		if(bestLobby == null){
			var lobbyCode = generateCode();
			while(lobbyCode in publicLobbies || lobbyCode in privateLobbies){
				lobbyCode = generateCode();
			}
			
			var lobby = new Lobby(lobbyCode, socket.id, false);
			publicLobbies[lobbyCode] = lobby;
			console.log("Generated new public lobby with code " + lobbyCode);
			
			lobby.addPlayer(onlinePlayers[socket.id]);
			
			socket.gameLobby = lobby;
			
			lobby.start();
			socket.emit("enterLobby");
		}else{
			bestLobby.addPlayer(onlinePlayers[socket.id]);
			socket.gameLobby = bestLobby;
			socket.emit("enterLobby");
		}
	});
	
	/*
		A client is joining a specific lobby, if the given lobby code is valid.
	*/
	socket.on('clientJoinSelect', function(data){
		var code = data.lobbyCode.toUpperCase();
		var lobby = null;
		if(code in publicLobbies){
			lobby = publicLobbies[code];
		}else if(code in privateLobbies){
			lobby = privateLobbies[code];
		}else{
			console.log("Invalid code " + data.lobbyCode);
		}
		
		if(lobby != null){
			lobby.addPlayer(onlinePlayers[socket.id]);
			socket.gameLobby = lobby;
			socket.emit("enterLobby");
		}
	});
	
	/*
		A client is hosting a lobby - public or private.
	*/
	socket.on('clientHost', function(data){
		var lobbyCode = generateCode();
		while(lobbyCode in publicLobbies || lobbyCode in privateLobbies){
			lobbyCode = generateCode();
		}
		
		var lobby;
		if(data.privateLobby){
			lobby = new Lobby(lobbyCode, socket.id, true);
			privateLobbies[lobbyCode] = lobby;
			console.log("Generated new private lobby with code " + lobbyCode);
		}else{
			lobby = new Lobby(lobbyCode, socket.id, false);
			publicLobbies[lobbyCode] = lobby;
			console.log("Generated new public lobby with code " + lobbyCode);
		}
		
		lobby.addPlayer(onlinePlayers[socket.id]);
		
		socket.gameLobby = lobby;
		
		lobby.start();
		socket.emit("enterLobby");
	});
	
	/*
		A client is telling the lobby to start up a game.
	*/
	socket.on('startGame', function(){
		socket.gameLobby.startGame();
	});
	
	/*
		Key events from the client (passes them to lobbies).
	*/
	socket.on('keyDown', function(data){
		socket.gameLobby.keyDown(socket, data.keyCode);
	});
	
	socket.on('keyUp', function(data){
		socket.gameLobby.keyUp(socket, data.keyCode);
	});
});


/*
	Removes first instance of element from array.
*/
function arrayRemove(array, element){
	var index = array.indexOf(element);
	if (index > -1) {
		array.splice(index, 1);
	}
};

/*
	Generates a random 6 character code.
*/
function generateCode(){
	var code = "";
    var set = "ABCDEFGHJKLMNPQRTWXY34689";

    for(var i = 0; i < 6; i++){
        code += set.charAt(Math.floor(Math.random() * set.length));
	}
    return code;
}