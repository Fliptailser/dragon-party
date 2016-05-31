
var testLobbyState = {
	
	preload: function(){
		bgm.stop();
	},
	
	create: function(){
		game.stage.disableVisibilityChange = true;
		var loginText = game.add.text(128, 72, "Test Lobby", { font: '100px Bubblegum Sans', fill: '#ffffff'});
		
		console.log(lobbyState);
		for(var thing in lobbyState){
			console.log(thing);
		}
	},
	
	start: function(){
		
	},
	
	update: function(){
		
	}
};
