/*
	The starting point for the client-side code.
	
	Sets up game states and responds to server and input messages (usually by triggering a method in the current game state).
*/

var socket = io();
socket.on("joinedTestLobby", enterTestLobby);
socket.on("removeEntity", removeEntity);
socket.on("lobbyUpdate", lobbyUpdate);
	
var game = new Phaser.Game(1280, 720, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });

function preload() {
	console.log("Loading...");
	var loadingLabel = game.add.text(80,150, 'Loading...', {font: '30px Bubblegum Sans', fill: '#ffffff'});
		
	game.load.spritesheet('joinPartyButton', 'assets/joinpartybutton.png', 350, 100);
	game.load.spritesheet('hostPartyButton', 'assets/hostpartybutton.png', 350, 100);
	game.load.spritesheet('joinAutoButton', 'assets/autobutton.png', 200, 60);
	game.load.spritesheet('joinSelectButton', 'assets/selectbutton.png', 200, 60);
	game.load.spritesheet('hostPublicButton', 'assets/publicbutton.png', 200, 60);
	game.load.spritesheet('hostPrivateButton', 'assets/privatebutton.png', 200, 60);
	game.load.audio('bgm_wakeup', 'sounds/bgm_wakeup.wav');
	game.load.spritesheet('testDragon', 'assets/testdragon.png', 200, 100);
	game.load.image('floor', 'assets/floor.png');
	game.load.image('wall', 'assets/wall.png');
	
	console.log("Load complete");
}

function create() {
	game.state.add('login', loginState);
	game.state.add('mainMenu', mainMenuState);
	game.state.add('testLobby', testLobbyState);

	game.input.keyboard.addCallbacks(this, gameKeyDown, gameKeyUp, gameKeyPress);
	
	game.state.start('login');
}

function update() {

}

/*
	Behavior for the name input box.
*/
var localPlayerName;
var nameSubmit = function(){
	localPlayerName = $("#namefield").val();
	game.state.start('mainMenu');
	$("#login").css("visibility", "hidden");
};

var lobbyCodeSubmit = function(){
	var lobbyCode = $("#lobbyCodeField").val();
	if(game.state.getCurrentState().key == 'mainMenu'){
		game.state.getCurrentState().joinSelect();
	}
}

function enterTestLobby(data){
	game.state.start('testLobby');
};

function lobbyUpdate(data){
	if(game.state.getCurrentState().key == 'testLobby' && testLobbyState.started){
		testLobbyState.updateState(data);
	}
}

function removeEntity(entID){
	if(game.state.getCurrentState().key == 'testLobby'){
		testLobbyState.removeEntity(entID);
	}
};

function gameKeyDown(keyEvent){
	if(game.state.getCurrentState().key == 'testLobby'){
		testLobbyState.gameKeyDown(keyEvent);
	}
}

function gameKeyUp(keyEvent){
	if(game.state.getCurrentState().key == 'testLobby'){
		testLobbyState.gameKeyUp(keyEvent);
	}
}

function gameKeyPress(keyEvent){
	
}