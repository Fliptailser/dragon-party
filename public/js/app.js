var localPlayerName;
var socket;

var nameSubmit = function(){
	localPlayerName = $("#namefield").val();
	game.state.start('mainMenu');
	$("#login").hide();
};

jQuery(function($){    
    'use strict';
	
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