var loadState = {
	preload: function(){
		var loadingLabel = game.add.text(80,150, 'Loading...', {font: '30px Bubblegum Sans', fill: '#ffffff'});
		
		game.load.image('sky', 'assets/sky.png');
		game.load.image('ground', 'assets/platform.png');
		game.load.image('star', 'assets/star.png');
		game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
	},
	
	create: function(){
		game.state.start('login');
	}
};