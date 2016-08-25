'use strict';
/**
* @file Contains all the classes for the game. Examples include Gem, Bug, ExWife, Player.
* Global variables beed used: BOARD
* @author Donald Shen <donald930224@hotmail.com>
*/


/**
* Board data.
* @global
*/
const BOARD = {
    stoneRows: 3,
    grassRows: 2,
    rowHeight: 83,

    numCols: 5,
    colWidth: 101,
    // For beauty purpose
    topSpace: 12,
    bottomSpace: 100,
};
// Add some flexibility
BOARD.numRows = 1 + BOARD.stoneRows + BOARD.grassRows;
BOARD.height = BOARD.topSpace + BOARD.rowHeight * BOARD.numRows + BOARD.bottomSpace;
BOARD.width = BOARD.colWidth * BOARD.numCols;

/**
* All characters' prototype
* @constructor
*/
var Character = function () {
    // Most characters only run inside the board
    this.border = {
        left: 0,
        right: BOARD.width - BOARD.colWidth,
        top: 0,
        bottom: (BOARD.numRows - 1) * BOARD.rowHeight,
    };
}
/**
* Render itself to the canvas.
* @param {Object} ctx - The 2d context from canvas.
*/
Character.prototype.render = function (ctx) {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
/**
* Bonus player can collect
* @constructor
* @param {string} type - Orange gem increates score.
* Blue gem can save your ass when your ex-wife find you
*/
var Gem = function (type) {
    Character.call(this);
    this.sprite = 'images/Gem ' + type + '.png';
    this.type = type;
    this.relocate();
}
Gem.prototype = Object.create(Character.prototype);
// Gem just scatter on board
Gem.prototype.relocate = function () {
    this.x = Math.floor(Math.random() * BOARD.numCols) * BOARD.colWidth;
    this.y = Math.floor(Math.random() * BOARD.numRows) * BOARD.rowHeight;
};

/**
* Another prototype, inherit from Character, have moving method
* @constructor
*/
var Mover = function () {
    Character.call(this);
    // This trick makes mover can move in multi-direction
    this.directions = {
        left: false,
        right: false,
        up: false,
        down: false,
    };
    // Most movers can level up their abilities
    this.level = 1;
    this.maxLevel = 10;
};
Mover.prototype = Object.create(Character.prototype);
/**
* By default mover can only move on board. But they could be appear outside the board.
* @param {number} distance
*/
Mover.prototype.move = function (distance) {
    if (this.directions.left && (this.x - distance) >= this.border.left) {
        this.x -= distance;
    }
    if (this.directions.right && (this.x + distance) <= this.border.right) {
        this.x += distance;
    }
    if (this.directions.up && (this.y - distance) >= this.border.top) {
        this.y -= distance;
    }
    if (this.directions.down && (this.y + distance) <= this.border.bottom) {
        this.y += distance;
    }
};
/**
* Mover will become stronger while the game level up.
*/
Mover.prototype.levelUp = function () {
    // Mostly they just move faster
    if (this.level < this.maxLevel) {
        this.level++;
        this.speedUp();
    }
};
Mover.prototype.speedUp = function () {
    this.speed += 5;
};


// Enemies our player must avoid
/**
* Bug is the common enemy. Inherit from Mover.
* @constructor
*/
var Bug = function () {
    Mover.call(this);
    this.sprite = 'images/enemy-bug.png';
    this.speed = Math.random() * 70 + 20;
    this.relocate();
};
Bug.prototype = Object.create(Mover.prototype);
/**
* This method will be called by main function. Update any movers' data.
* @param {number} dt - Time in seconds.
*/
Bug.prototype.update = function (dt) {
    // Bug doesn't use move method, it just run from left to right over and over
    this.x += this.speed * dt;
    if (this.x > (BOARD.width + 2 * BOARD.colWidth)) {
        this.relocate();
    }
};
/**
* Begin on the left outside the board.
*/
Bug.prototype.relocate = function () {
    this.x = -BOARD.colWidth;
    this.y = Math.ceil(Math.random() * BOARD.stoneRows) * BOARD.rowHeight;
};

/**
* A powerful enemy who can chase her ex-husband. Inherit from mover.
* @constructor
* @param {Player} player - Will become her chasing target.
* @param {string} sprite - An url direct to her sprite.
*/
var ExWife = function (player, sprite) {
    Mover.call(this);
    this.sprite = sprite;
    this.ex = player;
    // Exwife move slow. Lucky
    this.speed = 10;
    this.border['top'] = this.border['bottom'] - BOARD.rowHeight * (BOARD.grassRows - 1);
    // Evil bitch
    this.speech = ExWife.speeches[Math.floor(Math.random() * ExWife.speeches.length)];
    this.relocate();
}
ExWife.speeches = [
    'Still love U~',
    'Come back!',
    'I want 💎',
];
ExWife.prototype = Object.create(Mover.prototype);
/**
* This method will be called by main function. Update any movers' data.
* @param {number} dt - Time in seconds.
*/
ExWife.prototype.update = function (dt) {
    // Keep tracking the player
    this.directions.left = this.x > this.ex.x;
    this.directions.right = this.x < this.ex.x;
    this.directions.up = this.y > this.ex.y;
    this.directions.down = this.y < this.ex.y;
    this.move(dt * this.speed);
};
ExWife.prototype.relocate = function () {
    // Could be coming from both side
    if (Math.random() > 0.5) {
        this.x = -BOARD.colWidth;
    } else {
        this.x = BOARD.width;
    }
    this.y = this.border.bottom;
};
ExWife.prototype.speedUp = function () {
    this.speed += 2;
};
ExWife.prototype.render = function (ctx) {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    // She apparently has a lot to say.
    ctx.font = '20px sans-serif';
    ctx.fillText(this.speech, this.x, this.y + 40);
};

/**
* The character we can control. There should only be one player. Inherit from mover.
* @constructor
*/
var Player = function () {
    Mover.call(this);
    this.sprite = 'images/char-boy.png';
    this.speed = 50;
    this.maxLevel = 20;
    this.relocate();
};
Player.prototype = Object.create(Mover.prototype);
/**
* This method will be called by main function. Update any movers' data.
* @param {number} dt - Time in seconds.
*/
Player.prototype.update = function (dt) {
    this.move(dt * this.speed);
};
/**
* Begin on the bottom of the board.
*/
Player.prototype.relocate = function () {
    this.x = Math.floor(Math.random() * BOARD.numCols) * BOARD.colWidth;
    this.y = this.border.bottom + 50;
};
