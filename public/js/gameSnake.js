/*
	SNAKE
	
	Simple. It's snake, but with multiple players.
	
	Players are ranked by how long they are when they crash.
	
	
*/
var gameSnakeState = {
	 
	/*
		gameData: Information for each of the obstacles in the race, generated beforehand by the server.
	*/
	init: function(gameData){
		this.keyPoll = {"KeyW": false, "KeyS": false, "KeyA": false, "KeyD": false};
		
		this.boardWidth = 24;
		this.boardHeight = 12;
		this.boardGroup = game.add.group(); // Board tiles
		this.highlightGroup = game.add.group(); // Transparent squares that highlight board spaces with player-unique colors
		this.snakeGroup = game.add.group(); // Snakes
		this.labelGroup = game.add.group(); // UI and snake names
		this.overlayGroup = game.add.group(); // Anything on top, like the loading page or the results page
		
		this.snakes = null;
		this.snakeSprites = null; // Each snake gets a list of body sprites that update themselves.
		this.liveSnakes = null;
		this.playerSnakeIndex = null;
		this.foodSprites = {}; // foodSprites[location] -> sprite
		this.foodLocations = null;
		this.collisionLocations = null;
		
		this.speed = null;
		
		this.bgms = {
			6: game.add.audio('snakeSlow', 0.80, true),
			4: game.add.audio('snakeMedium', 0.80, true),
			3: game.add.audio('snakeFast', 0.80, true)
		};
		
		
		
		this.state = "pre";
	
	},
	
	create: function(){
		game.stage.disableVisibilityChange = true;
		game.sound.stopAll();
		game.add.sprite(0, 0, 'snakeSplash', 0, this.overlayGroup);
		var gameTitleLabel = game.add.text(100, 50, "Snake", { font: '80px Bubblegum Sans', fill: '#ddddff'}, this.overlayGroup);
		game.camera.flash(0x000000, 1000);
		
		game.time.events.add(Phaser.Timer.SECOND * 5, function(){
			game.camera.fade(0xFFFFFF, 1000);
			game.camera.onFadeComplete.add(function(){
				game.sound.play('snakeIntro', 0.60);
				
				// Hide instructions
				game.stage.backgroundColor = '#204020';
				this.overlayGroup.removeAll(true);
				
				// Snake board squares
				for(var j = 0; j < this.boardHeight; j++){	
					for(var i = 0; i < this.boardWidth; i++){
						game.add.sprite(gridXtoPixels(i), gridYtoPixels(j), 'snakeGrass', (i + j) % 2, this.boardGroup);
					}
				}
				socket.emit("gameReady");
				game.camera.flash(0xFFFFFF, 1000);
			},this);
		}, this);
	},
	
	// Update game data. Occurs asynchronously.
	// Audio and visuals should update in the client-side loop, which is synced.
	playhead: 0,
	
	
	serverUpdate: function(gameState){
		if(gameState.type != "lobby"){
			this.state = gameState.state;
			this.liveSnakes = gameState.liveSnakes;
			this.snakes = gameState.snakes;
			this.foodLocations = gameState.foodLocations;
			this.playerSnakeIndex = gameState.playerSnakeIndex;
			this.collisionLocations = gameState.collisionLocations;
			this.speed = gameState.speed;
			
			if(this.state == "running"){
				// Set up the next beat of music to play
				this.bgms[this.speed].addMarker('' + this.playhead, this.playhead, this.speed / 12);
				this.bgms[this.speed].play('' + this.playhead);
				this.playhead += this.speed / 12;
				if(this.playhead >= this.bgms[this.speed].totalDuration){
					this.playhead = 0;
					// Switch the BGM.
				}
				
				this.soundEffects(gameState.justAte, gameState.justDied);
			}
			
			this.spriteUpdates();
		}
	},
	
	soundEffects: function(justAte, justDied){
		if(justAte)
			game.sound.play('snakeEat');
		if(justDied)
			game.sound.play('snakeDie');
	},
	
	spriteUpdates: function(){
		
		if(!this.snakeSprites){
			this.snakeSprites = [];
			for(var i = 0; i < this.snakes.length; i++){
				var snek = this.snakes[i];
				var headSprite = game.add.sprite(gridXtoPixels(snek.x) + 25, gridYtoPixels(snek.y) + 25, 'snakeHead', 0, this.snakeGroup);
				var nameSprite = game.add.text(gridXtoPixels(snek.x) + 25, gridYtoPixels(snek.y), snek.name, { font: '25px Bubblegum Sans', fill: '#ddddff'}, this.labelGroup);
				headSprite.anchor.setTo(0.5,0.5);
				nameSprite.anchor.setTo(0.5,0.5);
				this.snakeSprites.push({name: nameSprite, head: headSprite, tail: [], decay: 0});
				
			}
		}
		
		// TODO:
		// Let snake collision checking happen after snake hitboxes update
		// Put highlight squares behind each snake sprite (color determined by snake's index)
		// Better snake sprites (code for the body segments to tell which sprite to use, straight or corner, and which rotation)
		// Still gotta fix the 180 suicide bug (snakes store last dir, then server != rule uses last dir, not current dir)
		// Bug: Player list not clearing
		// Bug: Food bug that is weird
		
		// For each snake:
		for(var i = 0; i < this.snakes.length; i++){
			// Essentially syncs sprites to the current data for each snake
			var sprites = this.snakeSprites[i];
			var snek = this.snakes[i];
			
			// Move the head sprite to the snake's location
			sprites.head.x = gridXtoPixels(snek.x) + 25;
			sprites.head.y = gridYtoPixels(snek.y) + 25;
			sprites.name.x = gridXtoPixels(snek.x) + 25;
			sprites.name.y = gridYtoPixels(snek.y);
			
			sprites.head.angle = 90 * snek.dir;
			// Move the body sprites to the locations specified in the snake's tail list
			
			// If the list of sprites is too short, add a new sprite to the end of it.
			for(var s = 0; s < snek.tail.length; s++){
				var tailPosition = snek.tail[s];
				
				if(s >= sprites.tail.length){
					sprites.tail.push(game.add.sprite(gridXtoPixels(tailPosition % this.boardWidth), gridYtoPixels(Math.floor(tailPosition / this.boardWidth)), 'snakeBody', 0, this.snakeGroup));
				}else{
					var tailSprite = sprites.tail[s];
					tailSprite.x = gridXtoPixels(tailPosition % this.boardWidth);
					tailSprite.y = gridYtoPixels(Math.floor(tailPosition / this.boardWidth));
				}
			}
			
			// If the snake is dead, start fading it away.
			if(!snek.alive){
				var decayAlpha = 1.0 - sprites.decay;
				sprites.head.alpha = decayAlpha;
				for(var s = 0; s < sprites.tail.length; s++){
					sprites.tail[s].alpha = decayAlpha;
				}
				
				// If the snake has faded away completely, remove the sprites
				if(decayAlpha <= 0){
					sprites.head.destroy();
					for(var s = 0; s < sprites.tail.length; s++){
						sprites.tail[s].destroy();
					}
					sprites.name.destroy();
				}
				
				sprites.decay += 0.2;
			}
		}
		
		
		// Go through foodSprites and check that each one maps to a foodLocation. Delete the foodSprites that don't.
		for(var location in this.foodSprites){
			if(this.foodLocations.indexOf(location) == -1){
				this.foodSprites[location].destroy();
				delete this.foodSprites[location];
				
			}
		}
		
		// Go through foodLocations and check that each one maps to a sprite. If not, add a new sprite
		for(var i = 0; i < this.foodLocations.length; i++){
			var foodLoc = this.foodLocations[i];
			
			if(Object.keys(this.foodSprites).indexOf(foodLoc) == -1){
				var foodSprite = game.add.sprite(gridXtoPixels(foodLoc % this.boardWidth) + 25, gridYtoPixels(Math.floor(foodLoc / this.boardWidth)) + 25, 'snakeFood', 0, this.snakeGroup);
				foodSprite.anchor.setTo(0.5,0.5);
				this.foodSprites[foodLoc] = foodSprite;
				
			}
		}
	},
	
	
	update: function(){
		
	
		
		
	},
	
	gameEnd: function(data){
		for(var speed in this.bgms){
			this.bgms[speed].stop();
		}
		
		game.time.events.add(Phaser.Timer.SECOND * 1, function(){
			game.sound.play('snakeOutro', 0.60);
			
			var clientRank = null;
			var i = 0;
			while(clientRank == null){
				if(data.snakeRanks[i].index == this.playerSnakeIndex){
					clientRank = i + 1;
				}
				i += 1;
			}
			
			game.add.text(50, 150, "You were " + clientRank + ordinalSuffix(clientRank) + "!", { font: '80px Bubblegum Sans', fill: '#ddddff'});
		}, this);
		
		var leaderBoard1 = [];
		game.time.events.add(Phaser.Timer.SECOND * 5, function(){
			for(var i = 0; i < data.snakeRanks.length; i++){
				var snek = this.snakes[data.snakeRanks[i].index];
				leaderBoard1.push(game.add.text(100, 75 + 50*i, (i + 1) + ordinalSuffix(i + 1), { font: '60px Bubblegum Sans', fill: '#ddddff'}));
				leaderBoard1.push(game.add.text(225, 75 + 50*i, snek.name, { font: '60px Bubblegum Sans', fill: '#ddddff'}));
				leaderBoard1.push(game.add.text(450, 75 + 50*i, (snek.tail.length + 1) + " ft.", { font: '60px Bubblegum Sans', fill: '#ddddff'}));
			}
		}, this);
		
		game.time.events.add(Phaser.Timer.SECOND * 7, function(){
			for(var i in leaderBoard1){
				leaderBoard1[i].destroy();
			}
			
			// Show point totals and wait for the server to change
			var list = [];
			for(var i = 0; i < data.snakeRanks.length; i++){
				var snekRank = data.snakeRanks[i];
				list.push({points: snekRank.playerPoints, name: this.snakes[snekRank.index].name});
			}
			
			list.sort(function(a, b){
				return b.points - a.points;
			});
			
			for(var i = 0; i < list.length; i++){
				var snek = list[i];
				var rank = i + 1;
				leaderBoard1.push(game.add.text(100, 50 + 60*rank, rank + ordinalSuffix(rank), { font: '60px Bubblegum Sans', fill: '#ddddff'}));
				leaderBoard1.push(game.add.text(225, 50 + 60*rank, snek.name, { font: '60px Bubblegum Sans', fill: '#ddddff'}));
				leaderBoard1.push(game.add.text(450, 50 + 60*rank, snek.points, { font: '60px Bubblegum Sans', fill: '#ddddff'}));
			}
			
		}, this);
		
		
	},
	
	 keyDown: function(keyEvent){
		if(!this.keyPoll[keyEvent.code]){
			// key switched from up to down. Avoids the event flood that comes from holding a key down
			
			
			// Forward these actual key down events to the server (but only for relevant keys)
			if(keyEvent.code in this.keyPoll){
				this.keyPoll[keyEvent.code] = true;
				socket.emit("keyDown", {keyCode : keyEvent.code});
			}
			
			// Do trigger actions based on the input
			// if(this.state == "running"){
				// switch(keyEvent.code){
					// case "KeyD":
						// if(this.snakes[this.playerSnakeIndex].dir != 2)
							// this.snakes[this.playerSnakeIndex].dir = 0;
						// break;
					// case "KeyA":
						// if(this.snakes[this.playerSnakeIndex].dir != 0)
							// this.snakes[this.playerSnakeIndex].dir = 2;
						// break;
					// case "KeyS":
						// if(this.snakes[this.playerSnakeIndex].dir != 3)
							// this.snakes[this.playerSnakeIndex].dir = 1;
						// break;
					// case "KeyW":
						// if(this.snakes[this.playerSnakeIndex].dir != 1)
							// this.snakes[this.playerSnakeIndex].dir = 3;
						// break;
				// }
			// }
		}
	},
	
	keyUp: function(keyEvent){
		if(keyEvent.code in this.keyPoll){
			this.keyPoll[keyEvent.code] = false;
			socket.emit("keyUp", {keyCode : keyEvent.code});
		}
	}
};

var gridXtoPixels = function(gridX){
	return 40 + gridX*50;
}

var gridYtoPixels = function(gridY){
	return 80 + gridY*50;
}

var ordinalSuffix = function(number){
	var str = number.toString();
	switch(str[str.length - 1]){
		case '1':
			return "st";
		case '2':
			return "nd";
		case '3':
			return "rd";
		default:
			return "th";		
	}
	
};