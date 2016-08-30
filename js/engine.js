'use strict';
/**
* @file Contains the main logic of the game.
* @author Donald Shen <donald930224@hotmail.com>
*/


(function () {
    /* Predefine the variables we'll be using within this scope,
    * create the canvas element, grab the 2D context for that canvas
    * set the canvas elements height/width and add it to the DOM.
    */
    var canvas = document.createElement('canvas');
    canvas.width = board.width;
    canvas.height = board.height;
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    // Game datas and statistics. These variables will be reset when init is called.
    var lastTime;
    var pause;
    var player;
    var allEnemies;
    var exWifes;
    var gems;

    var score;
    var level;
    var blueGem;
    var lives;
    /**
    * Init() will be called when we start a new game.
    */
    function init() {
        // Prepare the datas for a new game.
        player = new Player();
        allEnemies = [];
        for (var i = 0; i < 3; i++) {
            allEnemies.push(new Bug());
        }
        // Each stands for an ex-wife.
        exWifes = [
            'images/char-cat-girl.png',
            'images/char-horn-girl.png',
            'images/char-pink-girl.png',
            'images/char-princess-girl.png',
        ];
        gems = [];
        lastTime = Date.now();
        pause = false;

        score = 0;
        level = 1;
        blueGem = 0;
        lives = 3;
        // Start.
        main();
    }

    /**
    * The main game loop function. Will be called continuously until we kill the game.
    */
    function main() {
        var now = Date.now();
        var dt = (now - lastTime) / 1000.0;
        // When true, stop updating the game and wait for orders from player.
        if (lives > 0 && !pause) {
            update(dt);
        }
        lastTime = now;
        window.requestAnimationFrame(main);

        render();
    }
    /**
    * Update game data since last time.
    * @param {number} dt - past time in seconds since last update.
    */
    function update(dt) {
        updateEntities(dt);
        checkForAttack();
        checkForGem();
        checkIfWin();
    }
    /**
    * Update every character's data since last time.
    * @param {number} dt - past time in seconds since last update.
    */
    function updateEntities(dt) {
        allEnemies.forEach(function (enemy) {
            enemy.update(dt);
        });
        player.update(dt);
    }
    /**
    * Help function for any collision problem
    * @param {Object} p1 - Only use its coordinates properties. p2 is similar.
    * @param {number} p1.x
    * @param {number} p1.y
    * @returns {boolean} Whether there is a collision.
    */
    function checkCollisions(p1, p2) {
        var distance = Math.sqrt(Math.pow(p1.x-p2.x, 2) + Math.pow(p1.y-p2.y, 2));
        var collisionDist = 40;
        return  distance < collisionDist;
    }
    /**
    * Watch out for attacks coming from bugs and ex-wives.
    */
    function checkForAttack() {
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
    /**
    * Check if player can pick up a gem.
    */
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
    /**
    * Check if play reach the top of the board.
    */
    function checkIfWin() {
        if (player.y < board.topSpace) {
            score += 100;
            levelUp();
            player.relocate();
        }
    }
    /**
    * Called when player win. Update game statistics and level up every character.
    */
    function levelUp() {
        // Let the game become more interesting
        level++;
        var ram = Math.random();
        // 50% add a gem
        if (ram < 0.4) {
            gems.push(new Gem('Orange'));
        } else if (ram < 0.5) {
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
    /**
    * This array holds the relative URL to the image used
    * for that particular row of the game level.
    */
    var rowImages = [
        'images/water-block.png',   // Top row is water
    ];
    for (var i = 0; i < board.stoneRows; i++) {
        rowImages.push('images/stone-block.png');
    }
    for (var i = 0; i < board.grassRows; i++) {
        rowImages.push('images/grass-block.png');
    }
    /**
    * Draw everything on the canvas.
    */
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        renderBackground();
        renderEntities();
        // Draw statistics
        ctx.font = '20px monospace';
        ctx.fillStyle = '#3d8ccc';
        ctx.fillText('score: ' + score, 0, 30);
        for (var i = 0; i < blueGem; i++) {
            ctx.fillText('💎', i * 28, 55);
        }

        // Make prettier
        var text = 'level:';
        if (level < 10) {
            text += ' ';
        }
        ctx.fillText(text + level, canvas.width - 98, 30);
        for (var i = 1; i <= lives; i++) {
            ctx.drawImage(Resources.get('images/Heart.png'), canvas.width - i * 28, 28, 25, 35);
        }

        if (pause) {
            ctx.font = '50px monospace';
            ctx.fillText('Pause', 170, canvas.height / 2 + 20);
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
        for (var row = 0; row < board.numRows; row++) {
            for (var col = 0; col < board.numCols; col++) {
                ctx.drawImage(Resources.get(rowImages[row]), col * board.colWidth, board.topSpace + row * board.rowHeight);
            }
        }
    }

    function renderEntities() {
        // Context need to be pass to each character.
        gems.forEach(function (g) {
            g.render(ctx);
        });
        allEnemies.forEach(function (e) {
            e.render(ctx);
        });
        player.render(ctx);
    }

    // Start to add keyboard events
    var allowedKeys = {
        32: 'space',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        82: 'r',
    };
    /**
    * Keep pressing down the keys means that player keep moving toward that direction.
    */
    document.addEventListener('keydown', function (e) {
        // Only add allowed keys to directions
        var key = allowedKeys[e.keyCode];
        if (key) {
            if (key == 'r' && lives <= 0) {
                init();
            } else if (key == 'space') {
                pause = !pause;
            }else {
                player.directions[key] = true;
            }
        }
    });
    /**
    * @todo Right now it will add key that isn't a direction to player.directions.
    */
    document.addEventListener('keyup', function (e) {
        var key = allowedKeys[e.keyCode];
        if (key) {
            player.directions[key] = false;
        }
    });
    // Cheating method!!!
    document.addEventListener('dblclick', function (e) {
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

})();
