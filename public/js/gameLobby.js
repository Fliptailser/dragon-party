var gameLobbyState = {
	
	// Entities are keyed by ID.
	entities: {},
	keyPoll: {},
	started: false,
	p2world: new p2.World(),
	
	// Labels are fixed, texts are updated with live values
	privacyLabel: null,
	privacyText: null,
	hostLabel: null,
	hostText: null,
	codeLabel: null,
	codeText: null,
	timerLabel: null,
	
	preload: function(){
		game.sound.stopAll();
	},
	
	create: function(){
		game.sound.stopAll();
		this.entities = {};
		this.keyPoll = {};
		this.started = false;
		this.p2world = new p2.World();
		
		// Labels are fixed; texts are updated with live values
		this.privacyLabel = null;
		this.privacyText = null;
		this.hostLabel = null;
		this.hostText = null;
		this.codeLabel = null;
		this.codeText = null;
		this.timerLabel = null;
		
		
		
		game.stage.disableVisibilityChange = true;
		//var loginText = game.add.text(128, 72, "Lobby", { font: '100px Bubblegum Sans', fill: '#ddddff'});
		
		this.addSideMenu();
		
		this.p2world.gravity = [0, -10];
		
		this.addWalls();
		
		game.stage.backgroundColor = '#124184';
		
		game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);
		
		// lobbyState comes from the server.
		this.keyPoll["KeyA"] = false;
		this.keyPoll["KeyD"] = false;
		
		this.started = true;
		
		var bgm = game.add.audio('bgmLobby', 0.20, true);
		bgm.play();
	},
	
	addSideMenu: function(){
		privacyLabel = game.add.text(1000, 50, "Lobby:", { font: '40px Bubblegum Sans', fill: '#ddddff'});
		hostLabel = game.add.text(1000, 120, "Host:", { font: '40px Bubblegum Sans', fill: '#ddddff'});
		codeLabel = game.add.text(1000, 190, "Passcode:", { font: '40px Bubblegum Sans', fill: '#ddddff'});
		
		privacyText = game.add.text(1250, 50, "[ Lobby ]", { font: '40px Bubblegum Sans', fill: '#ddddff'});
		hostText = game.add.text(1250, 120, "[ Host ]", { font: '40px Bubblegum Sans', fill: '#ddddff'});
		codeText = game.add.text(1250, 240, "[ Code ]", { font: '40px Bubblegum Sans', fill: '#ddddff'});
		privacyText.anchor.setTo(1, 0);
		hostText.anchor.setTo(1, 0);
		codeText.anchor.setTo(1, 0);
		
		// TODO: only the host should be able to use this
		var gameStartButton = game.add.button(1020, 320, 'joinSelectButton', this.startGame, this, 1, 0, 2, 0);
	},
	
	
	
	startGame: function(){
		
		
		// Server: Wait about 5 seconds
		// Client: Do a countdown from 5
		timerLabel = game.add.text(490, 150, "5", { font: '80px Bubblegum Sans', fill: '#ddddff'});
		timerLabel.anchor.setTo(0.5,0.5);
		game.time.events.add(Phaser.Timer.SECOND * 1, function(){ timerLabel.text = "4"}, this);
		game.time.events.add(Phaser.Timer.SECOND * 2, function(){ timerLabel.text = "3"}, this);
		game.time.events.add(Phaser.Timer.SECOND * 3, function(){ timerLabel.text = "2"}, this);
		game.time.events.add(Phaser.Timer.SECOND * 4, function(){ timerLabel.text = "1"}, this);
		game.time.events.add(Phaser.Timer.SECOND * 5, function(){ timerLabel.text = "0"}, this);
		game.time.events.add(Phaser.Timer.SECOND * 6, function(){
			
			socket.emit("startGame");
			
		}, this);
		
		// Server: Set this lobby's currentGame to a new minigame (the game object has a reference back to parentLobby)
		// Client: Set the game state to the minigame indicated by the server.
		
	},
	
	addWalls: function(){
		var wallLeft = new p2.Body({
			mass: 0,
			position: [ 20 / 20, 360 / -20]
		});
		wallLeft.addShape(new p2.Box({width: 40 / 20, height: 720 / 20}));
		this.p2world.addBody(wallLeft);
		var wallLeftSprite = this.game.add.sprite(0, 0, 'wall');
		
		var wallRight = new p2.Body({
			mass: 0,
			position: [ (1280 - 320) / 20, 360 / -20]
		});
		wallRight.addShape(new p2.Box({width: 40 / 20, height: 720 / 20}));
		this.p2world.addBody(wallRight);
		var wallRightSprite = this.game.add.sprite(1280 - 320 - 20, 0, 'wall');
		
		var floor = new p2.Body({ 
			mass: 0, 
			position: [ 640 / 20, 700 / -20]
		});
		floor.addShape(new p2.Box({width:1280 / 20, height: 40 / 20}));
		this.p2world.addBody(floor);
		var floorSprite = this.game.add.sprite(0, 720 - 40, 'floor');
		
		var ceil = new p2.Body({ 
			mass: 0, 
			position: [ 640 / 20, 20 / -20]
		});
		ceil.addShape(new p2.Box({width:1280 / 20, height: 40 / 20}));
		this.p2world.addBody(ceil);
		var ceilSprite = this.game.add.sprite(0, 0, 'floor');
	},
	
	update: function(){
		
		// move controllable dragons
		for(var entID in this.entities){
			ent = this.entities[entID];
			if(ent.type == "Dragon"){
				if(ent.controllable){
					if(this.keyPoll["KeyA"] != this.keyPoll["KeyD"]){
						ent.body.velocity[0] = this.keyPoll["KeyD"] ? 10 : -10;
					}
				}
				// Control the dragon animations
				if(ent.sprite.animations.currentAnim.isPlaying){
					if(Math.abs(ent.body.velocity[0]) < 0.1){
						ent.sprite.animations.stop();
					}
				}else if(ent.body.velocity[0] != 0){
					ent.sprite.animations.play('walkright', 5, true, false);
				}
				//ent.sprite.animations.play('walkright', true, false);
				
				if(ent.body.velocity[0] > 0.1){
					
					ent.sprite.scale.x = .20;
					
				}else if(ent.body.velocity[0] < -0.1){
					
					ent.sprite.scale.x = -.20;
					
				}
			}
			
			ent.body.velocity[0] *= 0.80;
			
			
			
			
			if(ent.body.angle > Math.PI / 12){
				ent.body.angle = Math.PI / 12;
			}
			if(ent.body.angle < -Math.PI / 12){
				ent.body.angle = -Math.PI / 12;
			}
			
		}
		
		// sync sprites with bodies
		//console.log("update");
		this.p2world.step(1 / 60)
		for(var entID in this.entities){
			ent = this.entities[entID];
			//console.log(ent);
			if(ent.body && ent.sprite){
				ent.sprite.x = ent.body.position[0] * 20;
				ent.sprite.y = ent.body.position[1] * -20;
				ent.sprite.rotation = - ent.body.angle;
				ent.nameTag.x = ent.body.position[0] * 20 - ent.nameTag.width / 2;
				ent.nameTag.y = ent.body.position[1] * -20 - ent.sprite.height/2  - 45;
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
		// Update lobby info
		privacyText.text = (serverState.privateLobby ? "Private" : "Public");
		hostText.text = serverState.hostName;
		codeText.text = serverState.lobbyCode;
		
		// Update entities
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
				var dragonSprite = game.add.sprite(20 * entData.x, -20 * entData.y, 'dragonGreen');
				dragonSprite.anchor.setTo(0.5, 0.6);
				dragonSprite.scale.x = 0.20;
				dragonSprite.scale.y = 0.20;
				dragonSprite.animations.add('walkright', [0,1,2,3], 5, true);
				dragonSprite.animations.play('walkright');
				
				var dragonName = game.add.text(entData.x , entData.y - 50, entData.name, { font: '35px Bubblegum Sans', fill: '#ffaaaa'});
				
				// console.log(game.physics);
				// console.log(game.physics.p2);
				var dragonBody = new p2.Body({
					mass: 100,
					position: [entData.x , entData.y],
					angle: 0,
					velocity: [entData.dx, entData.dy],
					angularVelocity: 0
				});
				dragonBody.addShape(new p2.Box({width: 10, height:5}));
				this.p2world.addBody(dragonBody);
				this.entities[entData.id] = {type: "Dragon", body: dragonBody, controllable: entData.controllable, sprite: dragonSprite, nameTag: dragonName};
				break;
		}
		
	},

	updateEntity: function(entData){
		
		currentEnt = this.entities[entData.id];
		
		currentEnt.body.position[0] = entData.x;
		currentEnt.body.position[1] = entData.y;
		currentEnt.body.velocity[0] = entData.dx;
		currentEnt.body.velocity[1] = entData.dy;
		currentEnt.body.angle = entData.angle;
	},
	
	removeEntity: function(entID){
		console.log("Deleting entity " + entID);
		ent = this.entities[entID];
		ent.sprite.destroy();
		ent.nameTag.destroy();
		this.p2world.removeBody(ent.body);
		delete this.entities[entID];
	},
	
	keyDown: function(keyEvent){
		this.keyPoll[keyEvent.code] = true;
		if(["KeyA", "KeyD", "Space"].indexOf(keyEvent.code) != -1){
			socket.emit("keyDown", {keyCode : keyEvent.code});
		}
		
		if(keyEvent.code == "Space"){
			for(var entID in this.entities){
				ent = this.entities[entID];
				if(ent.controllable && ent.type == "Dragon"){
					ent.body.velocity[1] += 5;
				}
			}
		}
	},
	
	keyUp: function(keyEvent){
		this.keyPoll[keyEvent.code] = false;
		if(["KeyA", "KeyD", "Space"].indexOf(keyEvent.code) != -1){
			socket.emit("keyUp", {keyCode : keyEvent.code});
		}
	}
};