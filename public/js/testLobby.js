var Player = function(id, name, x, y) {
	this.id = id;
	this.name = name;
	this.x = x;
	this.y = y;
	this.dx = 0;
	this.dy = 0;
}

var testLobbyState = {
	// Entities are keyed by ID.
	entities: {},
	started: false,
	p2world: new p2.World(),
	
	preload: function(){
		bgm.stop();
		this.game.load.spritesheet('testDragon', 'assets/testdragon.png', 200, 100);
		this.game.load.image('floor', 'assets/floor.png');
	},
	
	create: function(){
		game.stage.disableVisibilityChange = true;
		var loginText = game.add.text(128, 72, "Test Lobby", { font: '100px Bubblegum Sans', fill: '#ddddff'});
		
		keyD = game.input.keyboard.addKey(Phaser.Keyboard.D);
		keyD.onDown.add(processD, this);
		
		this.p2world.gravity = [0, -10];
		
		var floor = new p2.Body({ 
			mass: 0, 
			position: [ 640 / 20, 700 / -20]
		});
		floor.addShape(new p2.Box({width:1280 / 20, height: 40 / 20}));
		
		this.p2world.addBody(floor);
		var floorSprite = this.game.add.sprite(0, 720 - 40, 'floor');
		
		game.stage.backgroundColor = '#124184';
		
		// lobbyState comes from the server.
		
		this.started = true;
	},
	
	update: function(){
		// sync sprites with bodies
		//console.log("update");
		this.p2world.step(1 / 60)
		for(var entID in this.entities){
			ent = this.entities[entID];
			//console.log(ent);
			if(ent.body && ent.sprite){
				ent.sprite.x = ent.body.position[0] * 20 - ent.sprite.width / 2;
				ent.sprite.y = ent.body.position[1] * -20 - ent.sprite.height/2;
				
				ent.nameTag.x = ent.body.position[0] * 20 - ent.nameTag.width / 2;
				ent.nameTag.y = ent.body.position[1] * -20 - ent.sprite.height/2  - 40;
				ent.nameTag.bringToTop();
			}
			
		}
	},
	
	/*
		Uses data received from the server to keep the scene up to date:
			Updating the properties of existing objects
			Creating objects that currently have not been spawned on the client
	*/
	updateState: function(serverState){
		
		for(var index in serverState.entities){
			var ent = serverState.entities[index];
			
			if(!(ent.id in this.entities)){
				this.makeEntity(ent);
			}else{
				this.updateEntity(ent);
			}
		}	
	},
	
	makeEntity: function(entData){
		// Converts data from the server to sprites
		
		switch(entData.type){
			case "Dragon":
				var dragonSprite = this.game.add.sprite(20 * entData.x, -20 * entData.y, 'testDragon');
				dragonSprite.animations.add('walkleft', [3,4,5], 5, true);
				dragonSprite.animations.add('walkright', [0,1,2], 5, true);
				dragonSprite.animations.play('walkright');
				
				var dragonName = game.add.text(entData.x , entData.y - 50, entData.name, { font: '40px Bubblegum Sans', fill: '#ffaaaa'});
				
				// console.log(game.physics);
				// console.log(game.physics.p2);
				var dragonBody = new p2.Body({
					mass: 100,
					position: [entData.x , entData.y],
					angle: 0,
					velocity: [0, 0],
					angularVelocity: 0
				});
				dragonBody.addShape(new p2.Box({width: 10, height:5}));
				this.p2world.addBody(dragonBody);
				this.entities[entData.id] = {type: "Dragon", body: dragonBody, controllable: entData.controllable, sprite: dragonSprite, nameTag: dragonName};
				break;
		}
		
	},

	updateEntity: function(entData){
		console.log("Server update");
		console.log(entData.y);
		currentEnt = this.entities[entData.id];
		console.log(currentEnt);
		currentEnt.body.position[0] = entData.x;
		currentEnt.body.position[1] = entData.y;
	},
	
	removeEntity: function(entID){
		console.log("Deleting entity " + entID);
		ent = testLobbyState.entities[entID];
		ent.sprite.destroy();
		ent.nameTag.destroy();
		testLobbyState.p2world.removeBody(ent.body);
		delete testLobbyState.entities[entID];
	}
};

function processD(){
	if(game.state.getCurrentState().key == 'testLobby'){
		// move controllable dragons right
		for(var entID in testLobbyState.entities){
			ent = testLobbyState.entities[entID];
			if(ent.controllable && ent.type == "Dragon"){
				ent.body.velocity[0] = 15;
			}
		}
	}
}


