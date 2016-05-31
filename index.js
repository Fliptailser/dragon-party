// Import the Express module
var express = require('express');

// Import the 'path' module (packaged with Node.js)
var path = require('path');

// Create a new instance of Express
var app = express();

// Import the Anagrammatix game file.
//var agx = require('./agxgame');

// Create a simple Express application
// Serve static html, js, css, and image files from the 'public' directory
app.use(express.static(path.join(__dirname,'public')));

// Create a Node.js based http server on port 8080
var server = require('http').createServer(app).listen(process.env.PORT);
console.log("Listening on port " + process.env.PORT + "...");
// Create a Socket.IO server and attach it to the http server
var io = require('socket.io').listen(server);

// Reduce the logging output of Socket.IO
// io.set('log level',1);

var Lobby = function() {
	this.players = {};
	
	this.addPlayer = function(socket, name, x, y){
		this.players[socket] = new Player(name, x, y);
	}
	
	/*
		Generates information for parts of the lobby's state that cannot be initialized solely by the client:
			Player positions and velocities
			
	*/
	this.getStateForClient = function(socket){
		var state = {};
		var playersState = [];
		for(var playerSocket in this.players){
			var player = this.players[playerSocket];
			playersState.push({
				name: player.name,
				x: player.x,
				y: player.y,
				dx: player.dx,
				dy: player.dy
			});
		}
		
		state["players"] = playersState;
		return state;
	}
}

var Player = function(name, x, y) {
	this.name = name;
	this.x = x;
	this.y = y;
	this.dx = 0;
	this.dy = 0;
}

var playerPool = [];
var testLobby = new Lobby();

// When a client connects, in here we have the connection: one socket between the server and the one client.
io.on('connection', function (socket) {

    console.log('client connected\t' + socket.id);
	socket.emit('connected', { message: "You are connected!" });
	
	/*
		Responses to messages from the client.
	*/
	socket.on('disconnect', function(){
		console.log('client disconnected\t' + socket.id);
		arrayRemove(playerPool, socket);
	});
	
	/*
		When a client tells the server it's joining a game.
	*/
	socket.on('playerJoin', function(data){
		console.log("Joining player named: " + data["name"]);
		
		playerPool.push(socket);
		
		// for now, just put them in a room.
		arrayRemove(playerPool, socket);
		testLobby.addPlayer(socket, data["name"], 250, 150);
		
		socket.emit("joinedTestLobby", testLobby.getStateForClient(socket));
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