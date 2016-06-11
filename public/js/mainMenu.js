
var mainMenuState = {
	
	preload: function(){
		
	},
	
	create: function(){
		console.log("Entering main menu.");
		game.stage.disableVisibilityChange = true;
		var loginText = game.add.text(128, 72, "Main Menu!", { font: '100px Bubblegum Sans', fill: '#ffffff'});
		console.log(playerData);
		
		var x = 1280 - 550;
		var joinText = game.add.text(x, 100, "Join a party", { font: '65px Bubblegum Sans', fill: '#ffffff'});
		var hostText = game.add.text(x, 450, "Host a party", { font: '65px Bubblegum Sans', fill: '#ffffff'});
		
		var joinAutoButton = game.add.button(x, 180, 'joinAutoButton', this.joinAuto, this, 1, 0, 2, 0);
		var joinSelectButton = game.add.button(x + 220, 180, 'joinSelectButton', this.showLobbyCodeWindow, this, 1, 0, 2, 0);
		
		var hostPublicButton = game.add.button(x, 530, 'hostPublicButton', this.hostPublic, this, 1, 0, 2, 0);
		var hostPrivateButton = game.add.button(x + 220, 530, 'hostPrivateButton', this.hostPrivate, this, 1, 0, 2, 0);
		//joinButton.inputEnabled = true;
		//joinButton.input.useHandCursor = true;
		
		var bgm = game.add.audio('bgm_wakeup', 0.15, true);
		bgm.play();
	},
	
	update: function(){
		
	},
	
	joinAuto: function(){
		console.log("Auto-joining a lobby.");
		socket.emit("clientJoinAuto");
	},
	
	joinSelect: function(lobbyCode){
		console.log("Joining lobby using code " + lobbyCode + ".");
		socket.emit("clientJoinSelect", {lobbyCode : lobbyCode});
	},
	
	hostPublic: function(){
		console.log("Hosting a public lobby.");
		socket.emit("clientHost", {privateLobby : false});
	},
	
	hostPrivate: function(){
		console.log("Hosting a private lobby.");
		socket.emit("clientHost", {privateLobby : true});
	},
	
	showLobbyCodeWindow: function(){
		$("#lobbyCode").css("visibility", "visible");
	}
};