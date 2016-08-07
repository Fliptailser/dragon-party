/*
	The starting point for the client-side code.
	
	Sets up game states and responds to server and input messages (usually by triggering a method in the current game state).
*/

var socket = io();
socket.on("enterLobby", enterLobby);
socket.on("removeEntity", removeEntity);
socket.on("gameUpdate", gameUpdate);
socket.on("loginSuccessful", loginSuccessful);
socket.on("launchGame", launchGame);
socket.on("go", gameGo);
socket.on("gameEnd", gameEnd);
socket.on("showResults", showResults);
	
var game = new Phaser.Game(1280, 720, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });
var playerData = null;

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
	game.load.audio('bgmLobby', 'sounds/bgm_lobby.wav');
	game.load.audio('fanfare', 'sounds/fanfare.wav');
	game.load.audio('amazed', 'sounds/amazed.wav');
	game.load.audio('sportsCrowd', 'sounds/sports_crowd.mp3');
	game.load.spritesheet('bhiran', 'assets/bhiran_sheet.png', 700, 450);
	game.load.image('track', 'assets/track.png');
	game.load.image('arrow', 'assets/arrow.png');
	game.load.image('skyTrack', 'assets/skytrack.png');
	game.load.image('finishLine', 'assets/finish_line.png');
	game.load.image('ringBack', 'assets/ring_back.png');
	game.load.image('ringFront', 'assets/ring_front.png');
	game.load.image('hurdle', 'assets/hurdle.png');
	
	game.load.image('floor', 'assets/floor.png');
	game.load.image('wall', 'assets/wall.png');
	game.load.image('sky', 'assets/sky.png');
	game.load.image('cloud', 'assets/cloud.png');
	
	game.load.image('snakeHead', 'assets/snake_head.png');
	game.load.image('snakeBody', 'assets/snake_body.png');
	game.load.image('snakeSplash', 'assets/snake_splash.png');
	game.load.image('snakeFood', 'assets/snake_food.png');
	game.load.spritesheet('snakeGrass', 'assets/snake_grass_tile.png', 50, 50);
	game.load.audio('snakeIntro', 'sounds/snake_intro.wav');
	game.load.audio('snakeSlow', 'sounds/snake_slow.wav');
	game.load.audio('snakeMedium', 'sounds/snake_medium.wav');
	game.load.audio('snakeFast', 'sounds/snake_fast.wav');
	game.load.audio('snakeOutro', 'sounds/snake_outro.wav');
	game.load.audio('snakeEat', 'sounds/snake_eat.wav');
	game.load.audio('snakeDie', 'sounds/snake_die.wav');
	
	console.log("Load complete");
}

function create() {
	game.state.add('login', loginState);
	game.state.add('mainMenu', mainMenuState);
	game.state.add('gameLobby', gameLobbyState);
	game.state.add('gameDragRace', gameDragRaceState);
	game.state.add('gameSnake', gameSnakeState);
	game.state.add('results', resultsState);
	
	game.input.keyboard.addCallbacks(this, gameKeyDown, gameKeyUp, gameKeyPress);
	
	game.state.start('login');
}

function update() {

}

/*
	Behavior for the name input box.
*/
var nameSubmit = function(){
	$("#login").css("visibility", "hidden");
	
	socket.emit("clientLogin", {playerName : $("#namefield").val()});
};

var lobbyCodeSubmit = function(){
	if(game.state.getCurrentState().key == 'mainMenu'){
		game.state.getCurrentState().joinSelect($("#lobbyCodeField").val());
	}
}

function enterLobby(){
	$("#lobbyCode").css("visibility", "hidden");
	game.state.start('gameLobby');
};

/*
	The server has accepted the login and returned player information.
*/
function loginSuccessful(data){
	if(game.state.getCurrentState().key == 'login'){
		playerData = {name : data.name};
		game.state.start('mainMenu');	
	}
}

function gameUpdate(data){
	switch(game.state.getCurrentState().key){
		case "gameLobby":
			if(game.state.getCurrentState().started){
				gameLobbyState.updateState(data);
			}
			break;
		case "gameDragRace":
		case "gameSnake":
			game.state.getCurrentState().serverUpdate(data);
			break;
	}
}

function launchGame(data){
	
	switch(data.gameType){
		case "dragRace":
			game.state.start('gameDragRace', true, false, data.gameData);
			break;
		case "snake":
			game.state.start('gameSnake', true, false, data.gameData);
			break;
	}
	
}

function gameEnd(data){
	switch(game.state.getCurrentState().key){
		case "gameDragRace":
		case "gameSnake":
			game.state.getCurrentState().gameEnd(data);
			break;
	}
}

function showResults(data){
	game.state.start('results', true, false, data);
}

function removeEntity(entID){
	if(game.state.getCurrentState().key == 'gameLobby'){
		gameLobbyState.removeEntity(entID);
	}
};

function gameGo(){
	switch(game.state.getCurrentState().key){
		case "gameDragRace":
			game.state.getCurrentState().go();
			break;
	}
}

function gameKeyDown(keyEvent){
	switch(game.state.getCurrentState().key){
		case "gameLobby":
		case "gameDragRace":
		case "gameSnake":
			game.state.getCurrentState().keyDown(keyEvent);
			break;
	}
}

function gameKeyUp(keyEvent){
	switch(game.state.getCurrentState().key){
		case "gameLobby":
		case "gameDragRace":
		case "gameSnake":
			game.state.getCurrentState().keyUp(keyEvent);
			break;
	}
}

function gameKeyPress(keyEvent){
	
}