var bootState = {
	create: function(){
		console.log(game);
		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.state.start('load');
	}
};