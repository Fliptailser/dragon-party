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

}($));

var lobbyState;
function enterTestLobby(data){
	game.state.start('testLobby');
	lobbyState = data;
}