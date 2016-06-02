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
	
	preload: function(){
		bgm.stop();
		this.game.load.spritesheet('testDragon', 'assets/testdragon.png', 200, 100);
	},
	
	create: function(){
		game.stage.disableVisibilityChange = true;
		var loginText = game.add.text(128, 72, "Test Lobby", { font: '100px Bubblegum Sans', fill: '#ffffff'});
		
		game.physics.startSystem(Phaser.Physics.P2JS);
		game.stage.backgroundColor = '#124184';
		game.physics.p2.gravity.y = 100;
		// lobbyState comes from the server.
		this.updateState(lobbyState);
		
	},
	
	start: function(){
		
	},
	
	update: function(){
		
	},
	
	/*
		Uses data received from the server to keep the scene up to date:
			Updating the properties of existing objects
			Creating objects that currently have not been spawned on the client
	*/
	updateState: function(lobbyState){
		console.log(lobbyState);
		for(var index in lobbyState.entities){
			var ent = lobbyState.entities[index];
			console.log(this.entities);
			console.log(ent.entity.id);
			if(!(ent.entity.id in this.entities)){
				this.makeEntity(ent.entity, ent.controllable);
			}else{
				this.updateEntity(ent.entity);
			}
		}	
	},
	
	makeEntity: function(entData, controllable){
		// Converts data from the server to sprites
		
		switch(entData.entityType){
			case "Dragon":
				var dragonSprite = this.game.add.sprite(entData.x, entData.y, 'testDragon');
				dragonSprite.animations.add('walkleft', [3,4,5], 5, true);
				dragonSprite.animations.add('walkright', [0,1,2], 5, true);
				dragonSprite.animations.play('walkright');
				game.physics.p2.enable(dragonSprite);
				this.entities[entData.id] = {controllable: controllable, sprite: dragonSprite};
				break;
		}
		
	},

	updateEntity: function(entData){
		console.log("UpdatePlayer?");
	}
};




