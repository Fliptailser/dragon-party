
var mainMenuState = {
	
	preload: function(){
		
	},
	
	create: function(){
		console.log("Entering main menu.");
		game.stage.disableVisibilityChange = true;
		var loginText = game.add.text(128, 72, "Main Menu!", { font: '100px Bubblegum Sans', fill: '#ffffff'});
		
		var x = 1280 - 550;
		var joinText = game.add.text(x, 135, "Join a party", { font: '65px Bubblegum Sans', fill: '#ffffff'});
		var hostText = game.add.text(x, 385, "Host a party", { font: '65px Bubblegum Sans', fill: '#ffffff'});
		
		var joinAutoButton = game.add.button(x, 220, 'joinAutoButton', this.joinAuto, this, 1, 0, 2, 0);
		var joinSelectButton = game.add.button(x + 220, 220, 'joinSelectButton', this.showLobbyCodeWindow, this, 1, 0, 2, 0);
		
		var hostPublicButton = game.add.button(x, 470, 'hostPublicButton', this.hostPublic, this, 1, 0, 2, 0);
		var hostPrivateButton = game.add.button(x + 220, 470, 'hostPrivateButton', this.hostPrivate, this, 1, 0, 2, 0);
		//joinButton.inputEnabled = true;
		//joinButton.input.useHandCursor = true;
		
		var bgm = game.add.audio('bgm_wakeup', 0.15, true);
		bgm.play();
	},
	
	update: function(){
		
	},
	
	joinAuto: function(){
		console.log("Auto-joining a lobby.");
	},
	
	joinSelect: function(){
		$("#lobbyCode").css("visibility", "hidden");
		console.log("Joining a specific lobby.");
		
	},
	
	hostPublic: function(){
		console.log("Hosting a public lobby.");
	},
	
	hostPrivate: function(){
		console.log("Hosting a private lobby.");
	},
	
	showLobbyCodeWindow: function(){
		$("#lobbyCode").css("visibility", "visible");
	}
};

/*
	
*/
function playerJoin () {
	console.log("Joining game server.");
	socket.emit("playerJoin", {name : localPlayerName});
}

function pass(){
	console.log("pass");
}