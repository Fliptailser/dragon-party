
var mainMenuState = {
	
	preload: function(){
		
	},
	
	create: function(){
		console.log("Entering main menu.");
		game.stage.disableVisibilityChange = true;
		var loginText = game.add.text(128, 72, "Main Menu!", { font: '100px Bubblegum Sans', fill: '#ffffff'});
		
		var joinButton = game.add.button(1280 - 500, 200, 'joinPartyButton', playerJoin, this, 1, 0, 2, 0);
		joinButton.inputEnabled = true;
		joinButton.input.useHandCursor = true;
		
		var bgm = game.add.audio('bgm_wakeup', 0.15, true);
		bgm.play();
	},
	
	update: function(){
		
	}
};

/*
	
*/
function playerJoin () {
	console.log("Joining game server.");
	socket.emit("playerJoin", {name : localPlayerName});
}