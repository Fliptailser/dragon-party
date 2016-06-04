var localPlayerName;
var socket;

var nameSubmit = function(){
	localPlayerName = $("#namefield").val();
	game.state.start('mainMenu');
	$("#login").hide();
};

jQuery(function($){    
    'use strict';

	game.state.add('boot', bootState);
	game.state.add('load', loadState);
	game.state.add('login', loginState);
	game.state.add('mainMenu', mainMenuState);
	game.state.add('testLobby', testLobbyState);
	
	game.state.start('boot');
	
	socket.on("joinedTestLobby", enterTestLobby);
	socket.on("removeEntity", removeEntity);
	socket.on("lobbyUpdate", lobbyUpdate);
}($));

//var lobbyState;
function enterTestLobby(data){
	game.state.start('testLobby');
	//lobbyState = data;
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