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
	this.entities = {};
	this.IDcount = 0;
	
	this.addDragon = function(socket, name, x, y){
		this.entities[this.IDcount] = {entity: new Dragon(this.IDcount, name, x, y), controllers: [socket]};
		this.IDcount += 1;
	}
	
	/*
		Generates information for parts of the lobby's state that cannot be initialized solely by the client:
			Player positions and velocities
			
	*/
	this.getStateForClient = function(socket){
		console.log("Getting state for " + socket);
		var state = Object();
		var entityState = [];
		for(var entID in this.entities){
			var entityData = this.entities[entID];
			console.log("Checking if " + socket + " is in " + entityData.controllers + "...");
			console.log(entityData.controllers.indexOf(socket) != -1);
			entityState.push({
				entity: entityData.entity,
				controllable: entityData.controllers && entityData.controllers.indexOf(socket) != -1
			});
		}
		
		state.entities = entityState;
		return state;
	}
}

var Dragon = function(id, name, x, y) {
	this.id = id;
	this.entityType = "Dragon";
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
		
		for(var entID in testLobby.entities){
			var ent = testLobby.entities[entID];
			if(ent.controllers.indexOf(socket) != -1 && ent.entity.entityType == "Dragon"){
				console.log("Deleting entity " + entID);
				delete testLobby.entities[entID];
				// TODO: multiple rooms
				io.emit('removeEntity', entID);
			}
		}
	});
	
	/*
		When a client tells the server it's joining a game.
	*/
	socket.on('playerJoin', function(data){
		console.log("Joining player named: " + data["name"]);
		
		playerPool.push(socket);
		
		// for now, just put them in a room.
		arrayRemove(playerPool, socket);
		testLobby.addDragon(socket, data["name"], 250, 150);
		
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