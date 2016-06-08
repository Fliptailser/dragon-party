
var mainMenuState = {
	
	preload: function(){
		
	},
	
	create: function(){
		console.log("Entering main menu.");
		game.stage.disableVisibilityChange = true;
		var loginText = game.add.text(128, 72, "Main Menu!", { font: '100px Bubblegum Sans', fill: '#ffffff'});
		
		var joinButton = game.add.button(640 - 75, 360 - 40, 'testButton', playerJoin, this, 0, 1, 2, 3);
		
		var bgm = game.add.audio('bgm_wakeup', 0.15, true);
		bgm.play();
	},
	
	update: function(){
		
	}
};

/*
	When the button is pressed.
*/
function playerJoin () {
	console.log("Joining game server.");
	socket.emit("playerJoin", {name : localPlayerName});
}