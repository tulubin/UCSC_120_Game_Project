// End state
"use strict";
var End = function (game) { };
End.prototype = {
    create: function () {
        this.moveOn = false;

        this.endingScene = game.add.sprite(game.width / 2, game.height * 5 / 14, 'Ending');
        this.endingScene.anchor.set(0.5);

        this.endText = game.add.bitmapText(game.width / 2, game.height * 8 / 14, 'bitmapFont', 'You escaped', 16);
        this.endText.anchor.set(0.5);
        if (cheat) {
            this.cheatText = game.add.bitmapText(game.width / 2, game.height / 2 + 100, 'bitmapFont', 'But you cheated', 16);
            this.cheatText.anchor.set(0.5);
        }
        // set timer for delay messages
        game.time.events.add(Phaser.Timer.SECOND * 2, function () {
            this.spacebar = game.add.sprite(game.width / 2, game.height - 50, 'Spacebar');
            this.spacebar.anchor.set(0.5);
            this.spacebarText_f = game.add.bitmapText(game.width / 2 - 60, game.height - 58, 'bitmapFont', 'Press', 16);
            this.spacebarText_b = game.add.bitmapText(game.width / 2 + 20, game.height - 58, 'bitmapFont', 'to Restart', 16);
            this.moveOn = true;
        }, this);
    },
    update: function () {
        // input to continue
        if (this.moveOn) {
            if (game.input.keyboard.justPressed(Phaser.Keyboard.SPACEBAR)) {
                game.state.start('Play');
            }
        }
    }
};