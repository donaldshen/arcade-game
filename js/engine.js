'use strict';


/* Predefine the variables we'll be using within this scope,
* create the canvas element, grab the 2D context for that canvas
* set the canvas elements height/width and add it to the DOM.
*/
var doc = document;
var canvas = doc.createElement('canvas');
canvas.width = GameData.width;
canvas.height = GameData.height;
doc.body.appendChild(canvas);

var ctx = canvas.getContext('2d');
// Game data
var lastTime;
var player;
var allEnemies;
var exWifes;
var gems;
// Statistics
var score;
var level;
var blueGem;
var lives;
// New game
function init() {
    player = new Player();
    allEnemies = [];
    for (var i = 0; i < 3; i++) {
        allEnemies.push(new Bug());
    }
    exWifes = [
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
    ];
    gems = [];
    lastTime = Date.now();

    score = 0;
    level = 1;
    blueGem = 0;
    lives = 3;
    main();
}

// Game loop
function main() {
    if (lives > 0) {
        var now = Date.now();
        var dt = (now - lastTime) / 1000.0;
        update(dt);
        render();
        lastTime = now;
        window.requestAnimationFrame(main);
    }
}

function update(dt) {
    updateEntities(dt);
    checkForAttack();
    checkForGem();
    checkIfWin();
}

function updateEntities(dt) {
    allEnemies.forEach(function (enemy) {
        enemy.update(dt);
    });
    player.update(dt);
}
// Help function for any collision problem
function checkCollisions(p1, p2) {
    var distance = Math.sqrt(Math.pow(p1.x-p2.x, 2) + Math.pow(p1.y-p2.y, 2));
    var collisionDist = 40;
    return  distance < collisionDist;
}

function checkForAttack() {
    // Watch out for attacks coming from bugs and ex-wives
    var removeList = [];
    // Use some instead of forEach. The reason is player could encounter with multiple bugs at the same time.
    allEnemies.some(function (e) {
        if (checkCollisions(e, player)) {
            // If you meet your ex-wife, you better have gems
            if (e instanceof ExWife && blueGem > 0) {
                blueGem--;
                exWifes.push(e.sprite);
                removeList.push(e);
            } else {
                lives--;
                player.relocate();
            }
            return true;
        } else {
            return false;
        }
    });
    removeList.forEach(function (w) {
        allEnemies.splice(allEnemies.indexOf(w), 1);
    })
}

function checkForGem() {
    var removeList = [];
    gems.forEach(function (g) {
        if (checkCollisions(g, player)) {
            removeList.push(g);
            if (g.type == 'Orange') {
                score += 50;
            } else {
                blueGem++;
            }
        }
    });
    removeList.forEach(function (g) {
        gems.splice(gems.indexOf(g), 1);
    })
}

function checkIfWin() {
    if (player.y < GameData.topSpace) {
        score += 100;
        levelUp();
        window.setTimeout(player.relocate(), 1000);
    }
}

function levelUp() {
    // Let the game become more interesting
    level++;
    var ram = Math.random();
    // 50% add a gem
    if (ram < 0.3) {
        gems.push(new Gem('Orange'));
    } else if (ram < 0.45) {
        gems.push(new Gem('Blue'));
    }

    // Make game harder by adding enemy or increasing enemies' speed
    ram = Math.random();
    if (ram > 0.6 && allEnemies.length < 10) {
        allEnemies.push(new Bug());
    } else {
        allEnemies.forEach(function (e) {
            e.levelUp();
        });
        player.levelUp();
    }
    // Could be much harder when level surpass 5
    if (exWifes.length > 0 && level >= 5) {
        if (ram < 0.4) {
            allEnemies.push(new ExWife(player, exWifes.shift()));
        }
    }
}

// Render Part
/* This array holds the relative URL to the image used
* for that particular row of the game level.
*/
var rowImages = [
    'images/water-block.png',   // Top row is water
];
for (var i = 0; i < GameData.stoneRows; i++) {
    rowImages.push('images/stone-block.png');
}
for (var i = 0; i < GameData.grassRows; i++) {
    rowImages.push('images/grass-block.png');
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    renderBackground();
    renderEntities();
    // Draw statistics
    ctx.font = '20px monospace';
    ctx.fillStyle = '#3d8ccc';
    ctx.fillText('score: ' + score, 0, 30);
    ctx.fillText('💎: ' + blueGem, 0, 53);
    // Make prettier
    var text = 'level:';
    if (level < 10) {
        text += ' ';
    }
    ctx.fillText(text + level, canvas.width - 98, 30);
    for (var i = 1; i <= lives; i++) {
        ctx.drawImage(Resources.get('images/Heart.png'), canvas.width - i * 30, 28, 30, 35);
    }

    if (lives <= 0) {
        // Draw game-over words
        ctx.font = '50px monospace';
        ctx.fillStyle = '#b13e64';
        ctx.fillText('Game Over', 110, canvas.height / 2);
        ctx.font = '22px monospace';
        ctx.fillText('Press R to Restart', 126, canvas.height / 2 + 30);
    }
}

function renderBackground() {
    for (var row = 0; row < GameData.numRows; row++) {
        for (var col = 0; col < GameData.numCols; col++) {
            ctx.drawImage(Resources.get(rowImages[row]), col * GameData.colWidth, GameData.topSpace + row * GameData.rowHeight);
        }
    }
}

function renderEntities() {
    gems.forEach(function (g) {
        g.render(ctx);
    });
    allEnemies.forEach(function (enemy) {
        enemy.render(ctx);
    });
    player.render(ctx);
}

/* Go ahead and load all of the images we know we're going to need to
* draw our game level. Then set init as the callback method, so that when
* all of these images are properly loaded our game will start.
*/
Resources.load([
    'images/stone-block.png',
    'images/water-block.png',
    'images/grass-block.png',
    'images/enemy-bug.png',
    'images/char-boy.png',
    'images/char-cat-girl.png',
    'images/char-horn-girl.png',
    'images/char-pink-girl.png',
    'images/char-princess-girl.png',
    'images/Gem Blue.png',
    'images/Gem Orange.png',
    'images/Heart.png',
]);
Resources.onReady(init);

var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
};
// Keep pressing down the keys means that player keep moving toward that direction
doc.addEventListener('keydown', function (e) {
    // Only add allowed keys to directions
    if (37 <= e.keyCode && e.keyCode <= 40) {
        player.directions[allowedKeys[e.keyCode]] = true;
    } else if (e.key == 'r') {
        if (lives <= 0) {
            init();
        }
    }
});
doc.addEventListener('keyup', function (e) {
    if (37 <= e.keyCode && e.keyCode <= 40) {
        player.directions[allowedKeys[e.keyCode]] = false;
    }
});

// Cheating method!!!
doc.addEventListener('dblclick', function (e) {
    var x = e.clientX - canvas.offsetLeft - 50;
    var y = e.clientY - canvas.offsetTop - 100;
    var newList = []
    allEnemies.forEach(function (e) {
        if (!checkCollisions(e, {'x': x, 'y': y})) {
            newList.push(e);
        }
    });
    allEnemies = newList;
});
