var joinButton;
var bgm;

var mainMenuState = {
	
	preload: function(){
		game.load.spritesheet('testButton', 'assets/testbutton.png', 150, 80);
		game.load.audio('bgm_wakeup', 'sounds/bgm_wakeup.wav');
	},
	
	create: function(){
		game.stage.disableVisibilityChange = true;
		var loginText = game.add.text(128, 72, "Greetings, " + localPlayerName + "!", { font: '100px Bubblegum Sans', fill: '#ffffff'});
		
		joinButton = game.add.button(640 - 75, 360 - 40, 'testButton', playerJoin, this, 0, 1, 2, 3);
		
		bgm = game.add.audio('bgm_wakeup', 0.15, true);
		bgm.play();
	},
	
	start: function(){
		
	},
	
	update: function(){
		
	}
};

function playerJoin () {
	console.log("Joining game server.");
	socket.emit("playerJoin", {socketID : socket.id, name : localPlayerName});
}