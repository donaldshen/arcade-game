// Global variables beed used: GameData

// All characters' prototype
var Character = function () {
    // Most character only run inside the board
    this.border = {
        left: 0,
        right: GameData.width - GameData.colWidth,
        top: 0,
        bottom: (GameData.numRows - 1) * GameData.rowHeight,
    };
}
Character.prototype.render = function (ctx) {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
// Bonus player can collect
// Orange gem increates score
// Blue gem can save your ass when your ex-wife find you
var Gem = function (type) {
    Character.call(this);
    this.sprite = 'images/Gem ' + type + '.png';
    this.type = type;
    this.relocate();
}
Gem.prototype = Object.create(Character.prototype);
Gem.prototype.relocate = function () {
    // Randomly scatter
    this.x = Math.floor(Math.random() * GameData.numCols) * GameData.colWidth;
    this.y = Math.floor(Math.random() * GameData.numRows) * GameData.rowHeight;
};

// Another prototype, inherit from Character. Add moving funciton
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
// Bug only runs on stone from left to right
var Bug = function () {
    Mover.call(this);
    this.sprite = 'images/enemy-bug.png';
    this.speed = Math.random() * 70 + 20;
    this.relocate();
};
Bug.prototype = Object.create(Mover.prototype);
Bug.prototype.update = function (dt) {
    // Bug doesn't use move method, it just run horizontally over and over
    this.x += this.speed * dt;
    if (this.x > (GameData.width + 2 * GameData.colWidth)) {
        this.relocate();
    }
};
Bug.prototype.relocate = function () {
    // Start at the left side
    this.x = -GameData.colWidth;
    this.y = Math.ceil(Math.random() * GameData.stoneRows) * GameData.rowHeight;
};

// Exwife only runs on grass, but she can chase the player.
var ExWife = function (player, sprite) {
    Mover.call(this);
    this.sprite = sprite;
    this.ex = player;
    // Exwife move slow. Lucky
    this.speed = 10;
    this.border['top'] = this.border['bottom'] - GameData.rowHeight * (GameData.grassRows - 1);
    // Evil bitch
    this.speech = ExWife.speeches[Math.floor(Math.random() * ExWife.speeches.length)];
    this.relocate();
}
ExWife.speeches = [
    'Still love U~',
    'Come back!',
    '🐂'
];
ExWife.prototype = Object.create(Mover.prototype);
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
        this.x = -GameData.colWidth;
    } else {
        this.x = GameData.width;
    }
    this.y = this.border.bottom;
};
ExWife.prototype.speedUp = function () {
    this.speed += 2;
};
ExWife.prototype.render = function (ctx) {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    ctx.font = '20px sans-serif';
    ctx.fillText(this.speech, this.x, this.y + 40);
};

// The only character we can control with keyboard
var Player = function () {
    Mover.call(this);
    this.sprite = 'images/char-boy.png';
    this.speed = 50;
    this.maxLevel = 20;
    this.relocate();
};
Player.prototype = Object.create(Mover.prototype);
Player.prototype.update = function (dt) {
    this.move(dt * this.speed);
};
Player.prototype.relocate = function () {
    // Start at the bottom
    this.x = Math.floor(Math.random() * GameData.numCols) * GameData.colWidth;
    this.y = this.border.bottom + 50;
};
