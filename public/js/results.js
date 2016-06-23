var resultsState = {
	dragons: [],
	
	init: function(data){
		
		this.dragons.push(data.client);
		
		for(var i = 0; i < data.otherPlayers.length; i++){
			this.dragons.push(data.otherPlayers[i]);
		}
		
		this.dragons.sort(function(a, b){
				return a.points - b.points;
		});
	},
	
	create: function(){
		
		game.sound.stopAll();
		game.stage.backgroundColor = '#888CA6';
		
		game.time.events.add(Phaser.Timer.SECOND * 2, function(){
			var header = game.add.text(128, 75, "Results!", { font: '80px Bubblegum Sans', fill: '#ffffff'});
		}, this);
		
		var ladder = [];
		var rank = this.dragons.length;
		for(var i = 0; i < this.dragons.length; i++){
			game.time.events.add(Phaser.Timer.SECOND * (3 + i/2), function(){
				for(var k = 0; k < ladder.length; k++){
					ladder[k].y +=  60;
				}
				
				ladder.push(game.add.text(740, 75, rank + ordinalSuffix(rank), { font: '60px Bubblegum Sans', fill: '#ddddff'}));
				ladder.push(game.add.text(865, 75, this.name, { font: '60px Bubblegum Sans', fill: '#ddddff'}));
				ladder.push(game.add.text(1090, 75, this.points, { font: '60px Bubblegum Sans', fill: '#ddddff'}));
			
				rank--;
			}, this.dragons[i]);
		}
		
		game.time.events.add(Phaser.Timer.SECOND * (3 + this.dragons.length/2), function(){
			var returnButton = game.add.button(128, 175, 'joinSelectButton', function(){
				game.state.start('gameLobby', true, false);
				
			}, this, 1, 0, 2, 0);
		}, this);
		
	},
	
	start: function(){
		
	}
};