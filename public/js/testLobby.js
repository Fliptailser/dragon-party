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
	
	preload: function(){
		bgm.stop();
		this.game.load.spritesheet('testDragon', 'assets/testdragon.png', 200, 100);
	},
	
	create: function(){
		game.stage.disableVisibilityChange = true;
		var loginText = game.add.text(128, 72, "Test Lobby", { font: '100px Bubblegum Sans', fill: '#ffffff'});
		
		keyD = game.input.keyboard.addKey(Phaser.Keyboard.D);
		keyD.onDown.add(processD, this);
		
		game.physics.startSystem(Phaser.Physics.P2JS);
		game.stage.backgroundColor = '#124184';
		game.physics.p2.gravity.y = 100;
		// lobbyState comes from the server.
		
		this.started = true;
	},
	
	update: function(){
		
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
				var dragonSprite = this.game.add.sprite(entData.x, entData.y, 'testDragon');
				dragonSprite.animations.add('walkleft', [3,4,5], 5, true);
				dragonSprite.animations.add('walkright', [0,1,2], 5, true);
				dragonSprite.animations.play('walkright');
				// console.log(game.physics);
				// console.log(game.physics.p2);
				this.game.physics.p2.enable(dragonSprite);
				this.entities[entData.id] = {type: "Dragon", controllable: entData.controllable, sprite: dragonSprite};
				break;
		}
		
	},

	updateEntity: function(entData){
		console.log("Server update");
		console.log(entData.y);
		currentEnt = this.entities[entData.id];
		console.log(currentEnt);
		currentEnt.sprite.body.x = entData.x;
		currentEnt.sprite.body.y = entData.y;
	}
};

function processD(){
	if(game.state.getCurrentState().key == 'testLobby'){
		// move controllable dragons right
		for(var entID in testLobbyState.entities){
			ent = testLobbyState.entities[entID];
			if(ent.controllable && ent.type == "Dragon"){
				ent.sprite.body.velocity.x = 150;
			}
		}
	}
}


