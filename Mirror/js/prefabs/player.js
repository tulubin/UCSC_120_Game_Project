// Player prefab

function Player(game) {
	// call Sprite constructor within this object
	// new Sprite(game, x, y, key, frame)
	Phaser.Sprite.call(this, game, GRID_SIZE * 52 + GRID_SIZE / 2, GRID_SIZE * 82 + GRID_SIZE / 2, 'Player');
	this.anchor.set(0.5);
	this.tint = DARK_TINT;
	this.currentHP = 100; // horror point
	this.maxHP = 100;
	this.currentMP = 100; // movement point
	this.maxMP = 100;
	this.currentBattery = 100;
	this.maxBattery = 100;
	this.sprinting = false;
	this.lastX = this.x;
	this.lastY = this.y;
	this.walkingDuration = 500;
	this.tweenCompleted = true;
	this.orientation = { up: false, down: true, left: false, right: false };
	this.directionAngle = 270 * Math.PI / 180;
	this.lightAngle = DEFAULT_VISION_ANGLE;
	this.numberOfRays = this.lightAngle * 25;
	this.rayLength = DEFAULT_VISION_LENGTH;
	this.isHided = false;
	this.recoverMP = true;
	this.inMirror = false;
	this.flashLightOn = false;
	this.hasFlashLight = false;
	this.switchToFlashLight = false;
	this.lightSourceX = this.x;
	this.lightSourceY = this.y + 3;
	this.frontObject = map.getTile(objectLayer.getTileX(this.centerX), objectLayer.getTileY(this.centerY + 32), objectLayer, true);
	this.frontObjectIndex = -1;
	this.switchToHUD = false;
	// Player sounds:
	footstep = game.add.audio('footstep');

	game.camera.follow(this, 0, 1, 1);

	//Add Player animation
	this.animations.add('walkUp', [4, 5, 6, 7], 6, true);
	this.animations.add('walkDown', [0, 1, 2, 3], 6, true);
	this.animations.add('walkLeft', [8, 9, 10, 11], 6, true);
	this.animations.add('walkRight', [12, 13, 14, 15], 6, true);

	timer = game.time.create(false);
	timer.loop(Phaser.Timer.SECOND, function () {
		if ((Phaser.Math.distance(this.x, this.y, shadow.x, shadow.y) < 100) && !this.isHided)
			this.currentHP -= 5;
		if (this.currentMP < this.maxHP && this.recoverMP)
			this.currentMP += 15;
		if ((this.isHided) && (this.currentHP < this.maxHP))
			this.currentHP += 15;
		if (this.currentHP > this.maxHP)
			this.currentHP = this.maxHP;
		if (this.currentHP < 0)
			this.currentHP = 0;
		if (this.currentMP > this.maxMP)
			this.currentMP = this.maxMP;
		if (this.currentMP < 0)
			this.currentMP = 0;
		if (!game.input.keyboard.upDuration(Phaser.Keyboard.SHIFT, 2000) && !game.input.keyboard.isDown(Phaser.Keyboard.SHIFT)) {
			this.recoverMP = true;
		}
		if (this.switchToFlashLight && this.flashLightOn && this.currentBattery >= 0) {
			if (this.currentBattery <= 0) {
				this.toggleFlashLight();
			} else {
				this.currentBattery -= 1;
				this.rayLength = DEFAULT_FLISHLIGHT_LENGTH / 2 * this.currentBattery / this.maxBattery + DEFAULT_FLISHLIGHT_LENGTH / 2;
			}

		}
	}, this);
	timer.start();

	shadow = new Shadow(game);
	game.add.existing(shadow);

	this.addLight();
	// HUD:
	// this.hud = new HUD(game);
	// this.hud.fixedToCamera = true;
	this.toggleHUD();
}

// inherit prototype from Phaser.Sprite and set constructor to Player
// the Object.create method creates a new object w/ the specified prototype object and properties
Player.prototype = Object.create(Phaser.Sprite.prototype);
// since we used Object.create, we need to explicitly set the constructor
Player.prototype.constructor = Player;

Player.prototype.update = function () {
	if (Phaser.Math.distance(this.lastX, this.lastY, shadow.x, shadow.y) < shadow.moveDis)
		this.updatePlayerXY();
	this.updateLight();
	// Player Controls:
	if (!this.isHided) {
		if ((game.input.keyboard.isDown(Phaser.Keyboard.SHIFT)) && (this.currentMP > 10)) {
			this.walkingDuration = 250;
			this.sprinting = true;
		} else {
			this.sprinting = false;
			this.walkingDuration = 500;
		}
		if (game.input.keyboard.isDown(Phaser.Keyboard.UP) && this.tweenCompleted) {
			this.animations.play("walkUp");
			this.orientation = { up: true, down: false, left: false, right: false }
			this.updateFrontObject(this.orientation);
			if (!game.input.keyboard.downDuration(Phaser.Keyboard.UP, CONTROL_RESPONSE_DELAY)) {
				this.checkCollision(this.centerX, this.centerY - 32, this.orientation);
			}
		} else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN) && this.tweenCompleted) {
			this.animations.play("walkDown");
			this.orientation = { up: false, down: true, left: false, right: false }
			this.updateFrontObject(this.orientation);
			if (!game.input.keyboard.downDuration(Phaser.Keyboard.DOWN, CONTROL_RESPONSE_DELAY)) {
				this.checkCollision(this.centerX, this.centerY + 32, this.orientation);
			}
		} else if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT) && this.tweenCompleted) {
			this.animations.play("walkLeft");
			this.orientation = { up: false, down: false, left: true, right: false }
			this.updateFrontObject(this.orientation);
			if (!game.input.keyboard.downDuration(Phaser.Keyboard.LEFT, CONTROL_RESPONSE_DELAY)) {
				this.checkCollision(this.centerX - 32, this.centerY, this.orientation);
			}
		} else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) && this.tweenCompleted) {
			this.animations.play("walkRight");
			this.orientation = { up: false, down: false, left: false, right: true }
			this.updateFrontObject(this.orientation);
			if (!game.input.keyboard.downDuration(Phaser.Keyboard.RIGHT, CONTROL_RESPONSE_DELAY)) {
				this.checkCollision(this.centerX + 32, this.centerY, this.orientation);
			}
		}
		if (game.input.keyboard.justPressed(Phaser.Keyboard.SPACEBAR) && this.hasFlashLight) {
			// toggle flashlight
			this.switchToFlashLight = !this.switchToFlashLight;
			this.toggleFlashLight();
		}
	}
	if (game.input.keyboard.justPressed(Phaser.Keyboard.U)) {
		// toggle HUD
		this.toggleHUD();
	}
	if (game.input.keyboard.justPressed(Phaser.Keyboard.E) && this.tweenCompleted) {
		switch (this.frontObject.index) {
			case MIRROR_1_INDEX:
				if (this.inMirror) {
					this.x -= 100 * GRID_SIZE;
					this.inMirror = false;
					if (shadow.moveToReal) {
						shadow.x -= 100 * GRID_SIZE;
						shadow.moveToReal = false;
					}
				} else {
					this.x += 100 * GRID_SIZE;
					this.inMirror = true;
				}
				break;
			case DOOR_1_INDEX:
				map.replace(DOOR_1_INDEX, DOOR_1_INDEX + 1, this.frontObject.x, this.frontObject.y, 1, 1, objectLayer);
				break;
			case DOOR_1_INDEX + 1:
				map.replace(DOOR_1_INDEX + 1, DOOR_1_INDEX, this.frontObject.x, this.frontObject.y, 1, 1, objectLayer);
				break;
			case CLOSET_1_INDEX:
			case CLOSET_1_INDEX + 1:
				map.replace(CLOSET_1_INDEX, CLOSET_1_INDEX + 2, this.frontObject.x - 1, this.frontObject.y, 2, 1, objectLayer);
				map.replace(CLOSET_1_INDEX + 1, CLOSET_1_INDEX + 3, this.frontObject.x, this.frontObject.y, 2, 1, objectLayer);
				this.toggleHide();
				break;
			case CLOSET_1_INDEX + 2:
			case CLOSET_1_INDEX + 3:
				map.replace(CLOSET_1_INDEX + 2, CLOSET_1_INDEX, this.frontObject.x - 1, this.frontObject.y, 2, 1, objectLayer);
				map.replace(CLOSET_1_INDEX + 3, CLOSET_1_INDEX + 1, this.frontObject.x, this.frontObject.y, 2, 1, objectLayer);
				this.toggleHide();
				break;
			case CLOSET_2_INDEX:
			case CLOSET_2_INDEX + 1:
				map.replace(CLOSET_2_INDEX, CLOSET_2_INDEX + 2, this.frontObject.x - 1, this.frontObject.y, 2, 1, objectLayer);
				map.replace(CLOSET_2_INDEX + 1, CLOSET_2_INDEX + 3, this.frontObject.x, this.frontObject.y, 2, 1, objectLayer);
				this.toggleHide();
				break;
			case CLOSET_2_INDEX + 2:
			case CLOSET_2_INDEX + 3:
				map.replace(CLOSET_2_INDEX + 2, CLOSET_2_INDEX, this.frontObject.x - 1, this.frontObject.y, 2, 1, objectLayer);
				map.replace(CLOSET_2_INDEX + 3, CLOSET_2_INDEX + 1, this.frontObject.x, this.frontObject.y, 2, 1, objectLayer);
				this.toggleHide();
				break;
			case DESK_1_INDEX:
			case DESK_1_INDEX + 1:
				map.replace(DESK_1_INDEX, DESK_1_INDEX + 2, this.frontObject.x - 1, this.frontObject.y, 2, 1, objectLayer);
				map.replace(DESK_1_INDEX + 1, DESK_1_INDEX + 3, this.frontObject.x, this.frontObject.y, 2, 1, objectLayer);
				this.toggleHide();
				break;
			case DESK_1_INDEX + 2:
			case DESK_1_INDEX + 3:
				map.replace(DESK_1_INDEX + 2, DESK_1_INDEX, this.frontObject.x - 1, this.frontObject.y, 2, 1, objectLayer);
				map.replace(DESK_1_INDEX + 3, DESK_1_INDEX + 1, this.frontObject.x, this.frontObject.y, 2, 1, objectLayer);
				this.toggleHide();
				break;
			case DESK_2_INDEX:
			case DESK_2_INDEX + 1:
				map.replace(DESK_2_INDEX, DESK_2_INDEX + 2, this.frontObject.x - 1, this.frontObject.y, 2, 1, objectLayer);
				map.replace(DESK_2_INDEX + 1, DESK_2_INDEX + 3, this.frontObject.x, this.frontObject.y, 2, 1, objectLayer);
				this.toggleHide();
				break;
			case DESK_2_INDEX + 2:
			case DESK_2_INDEX + 3:
				map.replace(DESK_2_INDEX + 2, DESK_2_INDEX, this.frontObject.x - 1, this.frontObject.y, 2, 1, objectLayer);
				map.replace(DESK_2_INDEX + 3, DESK_2_INDEX + 1, this.frontObject.x, this.frontObject.y, 2, 1, objectLayer);
				this.toggleHide();
				break;
			case BED_1_INDEX:
			case BED_1_INDEX + 1:
				map.replace(BED_1_INDEX, BED_1_INDEX + 2, this.frontObject.x - 1, this.frontObject.y, 2, 1, objectLayer);
				map.replace(BED_1_INDEX + 1, BED_1_INDEX + 3, this.frontObject.x, this.frontObject.y, 2, 1, objectLayer);
				this.toggleHide();
				break;
			case BED_1_INDEX + 2:
			case BED_1_INDEX + 3:
				map.replace(BED_1_INDEX + 2, BED_1_INDEX, this.frontObject.x - 1, this.frontObject.y, 2, 1, objectLayer);
				map.replace(BED_1_INDEX + 3, BED_1_INDEX + 1, this.frontObject.x, this.frontObject.y, 2, 1, objectLayer);
				this.toggleHide();
				break;
			case BED_2_INDEX:
			case BED_2_INDEX + 1:
				map.replace(BED_2_INDEX, BED_2_INDEX + 2, this.frontObject.x - 1, this.frontObject.y, 2, 1, objectLayer);
				map.replace(BED_2_INDEX + 1, BED_2_INDEX + 3, this.frontObject.x, this.frontObject.y, 2, 1, objectLayer);
				this.toggleHide();
				break;
			case BED_2_INDEX + 2:
			case BED_2_INDEX + 3:
				map.replace(BED_2_INDEX + 2, BED_2_INDEX, this.frontObject.x - 1, this.frontObject.y, 2, 1, objectLayer);
				map.replace(BED_2_INDEX + 3, BED_2_INDEX + 1, this.frontObject.x, this.frontObject.y, 2, 1, objectLayer);
				this.toggleHide();
				break;
			// default:
		}
	}

	// Play footsetps while moving:
	if (this.tweenCompleted === true) {
		footstep.stop();
		this.animations.stop();
	}
}

// move Player:
Player.prototype.movePlayer = function (directions) {
	if (!this.isHided) {
		footstep.play('', 0, 1, false, true);
		if (directions.up === true) {
			this.playerTween = game.add.tween(this).to({ x: this.centerX, y: this.centerY - 32 }, this.walkingDuration, Phaser.Easing.Linear.None, true);
		} else if (directions.down === true) {
			this.playerTween = game.add.tween(this).to({ x: this.centerX, y: this.centerY + 32 }, this.walkingDuration, Phaser.Easing.Linear.None, true);
		} else if (directions.left === true) {
			this.playerTween = game.add.tween(this).to({ x: this.centerX - 32, y: this.centerY }, this.walkingDuration, Phaser.Easing.Linear.None, true);
		} else if (directions.right === true) {
			this.playerTween = game.add.tween(this).to({ x: this.centerX + 32, y: this.centerY }, this.walkingDuration, Phaser.Easing.Linear.None, true);
		}
		this.tweenCompleted = false;
		this.playerTween.onComplete.add(this.playerTweenComplete, this);
		if (this.sprinting) {
			this.currentMP -= 10;
			this.recoverMP = false;
		}
	}
}

// check if player can move forward:
Player.prototype.checkCollision = function (x, y, directions) {
	var frontTileX = floorLayer.getTileX(x);
	var frontTileY = floorLayer.getTileY(y);
	var wallTile = map.getTile(frontTileX, frontTileY, wallLayer, true);
	if (wallTile.index === -1) { // check if it's not a wall
		var objectTile = map.getTile(frontTileX, frontTileY, objectLayer, true);
		switch (objectTile.index) { // check certain object for collision
			case DOOR_1_INDEX + 1:	// open door pass through
				this.movePlayer(directions);
				break;
			case CHEST_FLASHLIGHT_INDEX:	// open door pass through
				this.hasFlashLight = true;
				this.switchToFlashLight = true;
				this.movePlayer(directions);
				map.replace(CHEST_FLASHLIGHT_INDEX, -1, objectTile.x, objectTile.y, 1, 1, objectLayer);
				this.loadTexture('Player_f', 4);
				var newTween = game.add.tween(this).to({ x: this.centerX, y: this.centerY - 32 }, this.walkingDuration, Phaser.Easing.Linear.None, true);
				this.toggleFlashLight();
				newTween.onComplete.addOnce(this.flashlightPickupEvent, this);
				break;
			case -1: // no object infront
				this.movePlayer(directions);
				break;
			default:
		}
	}
}
Player.prototype.playerTweenComplete = function () {
	this.tweenCompleted = true;
	this.updateFrontObject(this.orientation);
}
Player.prototype.updateFrontObject = function (directions) {
	if (directions.up === true) {
		this.frontObject = map.getTile(objectLayer.getTileX(this.centerX), objectLayer.getTileY(this.centerY - 32), objectLayer, true);
		this.directionAngle = 90 * Math.PI / 180;
	} else if (directions.down === true) {
		this.frontObject = map.getTile(objectLayer.getTileX(this.centerX), objectLayer.getTileY(this.centerY + 32), objectLayer, true);
		this.directionAngle = 270 * Math.PI / 180;
	} else if (directions.left === true) {
		this.frontObject = map.getTile(objectLayer.getTileX(this.centerX - 32), objectLayer.getTileY(this.centerY), objectLayer, true);
		this.directionAngle = 0 * Math.PI / 180;
	} else if (directions.right === true) {
		this.frontObject = map.getTile(objectLayer.getTileX(this.centerX + 32), objectLayer.getTileY(this.centerY), objectLayer, true);
		this.directionAngle = 180 * Math.PI / 180;
	}
	if (this.frontObject !== null)
		this.frontObjectIndex = this.frontObject.index;
	else
		this.frontObjectIndex = -1;
}
Player.prototype.updatePlayerXY = function () {
	this.lastX = this.x;
	this.lastY = this.y;
}
Player.prototype.toggleHide = function () {
	this.isHided = !this.isHided;
	this.visible = !this.visible;
	this.toggleFlashLight();
}
Player.prototype.addLight = function () {
	maskGraphics = this.game.add.graphics(0, 0);
	floorLayer.mask = maskGraphics;
	wallLayer.mask = maskGraphics;
	objectLayer.mask = maskGraphics;
	decorations.mask = maskGraphics;
	// shadow.mask = maskGraphics;
}
Player.prototype.updateLight = function () {
	maskGraphics.clear();
	maskGraphics.lineStyle(2, RESET_TINT, 1);
	maskGraphics.beginFill(RESET_TINT);
	this.lightSourceX = this.x;
	this.lightSourceY = this.y + 3;
	maskGraphics.moveTo(this.lightSourceX, this.lightSourceY);
	for (var i = 0; i < this.numberOfRays; i++) {
		var rayAngle = this.directionAngle - (this.lightAngle / 2) + (this.lightAngle / this.numberOfRays) * i;
		var lastX = this.lightSourceX;
		var lastY = this.lightSourceY;
		var lightThrough = false;
		var k = 0;
		for (var j = 1; j <= this.rayLength; j++) {
			var wallTile = map.getTile(wallLayer.getTileX(lastX), wallLayer.getTileY(lastY), wallLayer, true);
			var objectTile = map.getTile(objectLayer.getTileX(lastX), objectLayer.getTileY(lastY), objectLayer, true);
			if ((Phaser.Math.distance(lastX, lastY, shadow.x, shadow.y) < 8) && (this.currentHP > 0) && !this.isHided) {
				this.currentHP -= 0.3 / game.time.fps;
				if (!shadow.startMove) {
					shadow.startMove = true;
					shadow.moveToReal = true;
				}
			}
			if (lightThrough && (k >= GRID_SIZE / 2 || (wallTile.index === -1 && objectTile.index !== DOOR_1_INDEX))) {
				maskGraphics.lineTo(lastX, lastY);
				break;
			} else {
				if (wallTile.index !== -1 || objectTile.index === DOOR_1_INDEX) {
					lightThrough = true;
				}
				if (lightThrough)
					k++;
				var landingX = Math.round(this.lightSourceX - (2 * j) * Math.cos(rayAngle));
				var landingY = Math.round(this.lightSourceY - (2 * j) * Math.sin(rayAngle));
				lastX = landingX;
				lastY = landingY;
			}
		}
		maskGraphics.lineTo(lastX, lastY);
	}
	maskGraphics.lineTo(this.lightSourceX, this.lightSourceY);
	maskGraphics.endFill();
	if (this.switchToFlashLight && this.flashLightOn) {
		var ran = Math.random();
		floorLayer.tint = (ran < 0.5) ? RESET_TINT : LIGHT_TINT;
		wallLayer.tint = (ran < 0.5) ? RESET_TINT : LIGHT_TINT;
		objectLayer.tint = (ran < 0.5) ? RESET_TINT : LIGHT_TINT;
		decorations.tint = (ran < 0.5) ? RESET_TINT : LIGHT_TINT;
		// floorLayer.alpha = 0.5 + Math.random() * 0.5;
	}
}
Player.prototype.toggleFlashLight = function () {
	if (this.currentBattery > 0) {
		if (!this.flashLightOn && this.hasFlashLight && !this.isHided && this.switchToFlashLight) {
			this.lightAngle = DEFAULT_FLASHLIGHT_ANGLE;
			this.rayLength = DEFAULT_FLISHLIGHT_LENGTH / 2 * this.currentBattery / this.maxBattery + DEFAULT_FLISHLIGHT_LENGTH / 2;
		} else {
			this.lightAngle = DEFAULT_VISION_ANGLE;
			this.rayLength = DEFAULT_VISION_LENGTH;
			this.tint = DARK_TINT;
			floorLayer.tint = DARK_TINT;
			wallLayer.tint = DARK_TINT;
			objectLayer.tint = DARK_TINT;
			decorations.tint = DARK_TINT;
		}
		this.flashLightOn = !this.flashLightOn;
		this.hud.flashlight_icon.visible = this.switchToFlashLight && this.flashLightOn;
		this.hud.battery_level.visible = this.switchToFlashLight && this.flashLightOn;
	} else {
		console.log('Zero Battery!');
		this.lightAngle = DEFAULT_VISION_ANGLE;
		this.rayLength = DEFAULT_VISION_LENGTH;
		this.tint = DARK_TINT;
		floorLayer.tint = DARK_TINT;
		wallLayer.tint = DARK_TINT;
		objectLayer.tint = DARK_TINT;
		decorations.tint = DARK_TINT;
		this.flashLightOn = false;
		this.hud.flashlight_icon.visible = false;
		this.hud.battery_level.visible = false;
	}
}

Player.prototype.toggleHUD = function () {
	if (!this.switchToHUD) {
		this.hud = new HUD(game);
		this.hud.fixedToCamera = true;
	} else {
		this.hud.destroy(true);
	}
	this.switchToHUD = !this.switchToHUD;
}
Player.prototype.flashlightPickupEvent = function () {
	console.log('you picked up a flashlight!');
	// do something
}

