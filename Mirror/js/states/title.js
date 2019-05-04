// Title state

var Title = function(game) {};
Title.prototype = {
	preload: function() {
		// Loading assets:
		game.load.image('Background', 'assets/img/background.png');
		game.load.image('Player', 'assets/img/player.png');
	},
	create: function() {
		// add title screen text
		var titleText = game.add.text(game.width/2, game.height/2, 'Mirror', {font: 'Helvetica', fontSize: '48px', fill: '#0000FF'});
		titleText.anchor.set(0.5);

		var playText = game.add.text(game.width/2, game.height*.8, 'Press W to Start', {font: 'Helvetica', fontSize: '24px', fill: '#fff'});
		playText.anchor.set(0.5);

	},
	update: function() {
		// input to continue
		if(game.input.keyboard.justPressed(Phaser.Keyboard.W)) {
			game.state.start('Play');
		}
	}
};