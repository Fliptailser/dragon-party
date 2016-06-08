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

// Reduce the logging output of Socket.IO
// io.set('log level',1);


function lobbyUpdates(){
	for(var entID in testLobby.entities){
		ent = testLobby.entities[entID];
		switch(ent.entity.entityType){
			case "Dragon":
				//console.log("Updating " + ent.entity.name);
				var countA = 0;
				var countD = 0;
				for(var i = 0; i < ent.controllers.length; i++){
					var control = ent.controllers[i];
					//console.log("\t" + control.id);
					//console.log("\tA: " + testLobby.keyPolls[control]["KeyA"]);
					//console.log("\tD: " + testLobby.keyPolls[control]["KeyD"]);
					if(testLobby.keyPolls[control]){
						countA += testLobby.keyPolls[control]["KeyA"] ? 1 : 0;
						countD += testLobby.keyPolls[control]["KeyD"] ? 1 : 0;
					}
				}
				if(countA != countD){
					ent.entity.velocity[0] = countD > countA ? 10 : -10;
				}
				break;
		}
		
		ent.entity.velocity[0] *= 0.80;
		
		if(ent.entity.angle > Math.PI / 12){
			ent.entity.angle = Math.PI / 12;
		}
		if(ent.entity.angle < -Math.PI / 12){
			ent.entity.angle = -Math.PI / 12;
		}
	}
	
	testLobby.p2world.step(1 / 30);
	
	for(var i = 0; i < testLobby.sockets.length; i++){
		sock = testLobby.sockets[i];
		sock.emit("lobbyUpdate", testLobby.getStateForClient(sock));
		
	}
}

var Lobby = function() {
	this.sockets = [];
	// Maps IDs to entitiy data.
	this.entities = {};
	// Maps sockets to key poll.
	this.keyPolls = {};
	this.p2world = new p2.World();
	this.IDcount = 0;
	
	// sets up timed updates to clients
	this.start = function(){
		
		var floor = new p2.Body({ 
			mass: 0, 
			position: [ 640 / 20, 700 / -20]
		});
		floor.addShape(new p2.Box({width:1280 / 20, height: 40 / 20}));
		this.p2world.addBody(floor);
		
		var ceil = new p2.Body({ 
			mass: 0, 
			position: [ 640 / 20, 20 / -20]
		});
		ceil.addShape(new p2.Box({width:1280 / 20, height: 40 / 20}));
		this.p2world.addBody(ceil);
		
		var wallLeft = new p2.Body({
			mass: 0,
			position: [ 20 / 20, 360 / -20]
		});
		wallLeft.addShape(new p2.Box({width: 40 / 20, height: 720 / 20}));
		this.p2world.addBody(wallLeft);
		
		
		var wallRight = new p2.Body({
			mass: 0,
			position: [ 1260 / 20, 360 / -20]
		});
		wallRight.addShape(new p2.Box({width: 40 / 20, height: 720 / 20}));
		this.p2world.addBody(wallRight);
		
		
		// Debug
		//this.addDragon("testSocket", "Dragon", -12.5, -10);
		
		setInterval(lobbyUpdates, 1000/30);
	}
	
	
	
	this.addDragon = function(socketID, name, x, y){
		var dragon = new p2.Body({
			mass: 100,
            position: [x / 20, y / -20],
            angle: 0,
            velocity: [0, 0],
            angularVelocity: 0
		});
		
		dragon.entityType = "Dragon";
		dragon.name = name;
		dragon.addShape(new p2.Box({width:10, height:5}));
		this.p2world.addBody(dragon);
		this.entities[this.IDcount] = {id: this.IDcount, entity: dragon, controllers: [socketID]};
		this.IDcount += 1;
	}
	
	/*
		Generates information for parts of the lobby's state that cannot be initialized solely by the client:
			Player positions and velocities
			
	*/
	this.getStateForClient = function(socket){
		
		var state = Object();
		var entityState = [];
		for(var entID in this.entities){
			var entityData = this.entities[entID];
			
			// Contextualizes "controllable" based on the particular client.
			// These controllable entities can be updated more immediately by the client.
			//console.log(entityData.entity.name + "\t" + entityData.entity.position[0]);
			
			entityState.push({
				id: entityData.id,
				name: entityData.entity.name,
				type: entityData.entity.entityType,
				x: entityData.entity.position[0],
				y: entityData.entity.position[1],
				dx: entityData.entity.velocity[0],
				dy: entityData.entity.velocity[1],
				angle: entityData.entity.angle,
				controllable: entityData.controllers && entityData.controllers.indexOf(socket.id) != -1
			});
		}
		
		state.entities = entityState;
		// if(entityState.length > 0){
			// console.log(entityState[0]);
		// }
		return state;
	}
}

var playerPool = [];
var testLobby = new Lobby();
testLobby.p2world.gravity = [0, -10];
testLobby.start();
// When a client connects, in here we have the connection: one socket between the server and the one client.
io.on('connection', function (socket) {

    console.log('client connected\t' + socket.id);
	
	
	testLobby.keyPolls[socket.id] = {};
	
	socket.emit('connected', { message: "You are connected!" });
	
	/*
		Responses to messages from the client.
	*/
	socket.on('disconnect', function(){
		console.log('client disconnected\t' + socket.id);
		for(var entID in testLobby.entities){
			var ent = testLobby.entities[entID];
			
			if(ent.controllers.indexOf(socket.id) != -1 && ent.entity.entityType == "Dragon"){
				console.log("Deleting entity " + entID);
				testLobby.p2world.removeBody(ent.entity);
				delete testLobby.entities[entID];
				// TODO: multiple rooms
				io.emit('removeEntity', entID);
			}
		}
		delete testLobby.keyPolls[socket.id];
		arrayRemove(playerPool, socket);
		arrayRemove(testLobby.sockets, socket);
		
	});
	
	/*
		When a client tells the server it's joining a game.
	*/
	socket.on('playerJoin', function(data){
		console.log("Joining player named: " + data.name);
		
		playerPool.push(socket);
		
		// for now, just put them in a room.
		arrayRemove(playerPool, socket);
		testLobby.sockets.push(socket);
		testLobby.addDragon(socket.id, data.name, (Math.random() * 2 + 1) * 320, 200);
		
		socket.emit("joinedTestLobby", testLobby.getStateForClient(socket));
	});
	
	/*
		Key events from the client.
	*/
	socket.on('keyDown', function(data){
		testLobby.keyPolls[socket.id][data.keyCode] = true;
		
		if(data.keyCode == "Space"){
			for(var entID in testLobby.entities){
				ent = testLobby.entities[entID];
				switch(ent.entity.entityType){
					case "Dragon":
						if(ent.controllers.indexOf(socket.id) != -1){
							ent.entity.velocity[1] += 5;
						}
						break;
				}
			}
		}
	});
	
	socket.on('keyUp', function(data){
		
		testLobby.keyPolls[socket.id][data.keyCode] = false;
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