var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var settings = {
    width: 25,
    height: 25,
    framesPerSec: 5,
    candies: 1
};
var Vec = (function () {
    function Vec(x, y) {
        this.x = x;
        this.y = y;
    }
    Vec.mod = function (p) {
        return new Vec((p.x + settings.width) % settings.width, (p.y + settings.height) % settings.height);
    };
    Vec.add = function (p, d) {
        return new Vec(p.x + d.x, p.y + d.y);
    };
    Vec.equals = function (p, d) {
        return p.x === d.x && p.y === d.y;
    };
    return Vec;
}());
function randInt(l, r) {
    return Math.floor(Math.random() * (r - l)) + l;
}
var Dirs = (function () {
    function Dirs() {
    }
    Dirs.up = new Vec(0, -1);
    Dirs.down = new Vec(0, 1);
    Dirs.left = new Vec(-1, 0);
    Dirs.right = new Vec(1, 0);
    return Dirs;
}());
var oneplayer = 0;
var gameover = 1;
var twoplayer = 2;
var state;
var snake;
var candies;
var Sprite = (function () {
    function Sprite() {
        this.body = [];
    }
    Sprite.prototype.update = function () { };
    ;
    Sprite.prototype.draw = function (p) { };
    ;
    Sprite.prototype.contains = function (p) {
        for (var i = 0; i < this.body.length; i++)
            if (this.body[i].x === p.x && this.body[i].y === p.y)
                return true;
        return false;
    };
    Sprite.isEmpty = function (sprites, p) {
        for (var i = 0; i < sprites.length; i++)
            if (sprites[i].contains(p))
                return true;
        return false;
    };
    return Sprite;
}());
var Snake = (function (_super) {
    __extends(Snake, _super);
    function Snake(x, y, d) {
        var _this = _super.call(this) || this;
        _this.direction = d;
        _this.body.push(new Vec(x, y));
        return _this;
    }
    Snake.prototype.draw = function (p) {
        p.push();
        for (var i = 1; i < this.body.length; i++)
            drawCell(p, this.body[i].x, this.body[i].y);
        p.fill(200);
        drawCell(p, this.body[0].x, this.body[0].y);
        p.pop();
    };
    ;
    Snake.prototype.update = function () {
        var nextHead = Vec.mod(Vec.add(this.body[0], this.direction));
        this.body.pop();
        if (this.contains(nextHead))
            return false;
        this.body.unshift(nextHead);
        return true;
    };
    Snake.prototype.grow = function () { this.body.push(new Vec(-1, -1)); };
    Object.defineProperty(Snake.prototype, "head", {
        get: function () { return this.body[0]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Snake.prototype, "nextHead", {
        get: function () {
            return Vec.mod(Vec.add(this.body[0], this.direction));
        },
        enumerable: true,
        configurable: true
    });
    return Snake;
}(Sprite));
var Candies = (function (_super) {
    __extends(Candies, _super);
    function Candies() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Candies.prototype.draw = function (p) {
        p.push();
        p.fill(255, 0, 0);
        for (var i = 0; i < this.body.length; i++)
            drawCell(p, this.body[i].x, this.body[i].y);
        p.pop();
    };
    Candies.prototype.add = function (sprites, q) {
        if (q === void 0) { q = 1; }
        for (var i = 0; i < q; i++) {
            var p = void 0;
            do {
                p = new Vec(randInt(0, settings.width), randInt(0, settings.height));
            } while (Sprite.isEmpty(sprites, p));
            this.body.push(p);
        }
    };
    Candies.prototype.remove = function (pos) {
        this.body = this.body.filter(function (p) { return !(Vec.equals(p, pos)); });
    };
    return Candies;
}(Sprite));
function handleInput(queue, f, repf) {
    if (repf === void 0) { repf = function () { return false; }; }
    var k = queue.shift();
    f(k);
    if (queue.length > 0 && repf())
        handleInput(queue, f, repf);
    return queue;
}
function drawCell(p, x, y) {
    var w = settings.width, h = settings.height;
    p.rect(p.width / w * x, p.height / h * y, p.width / w, p.height / h);
}
function gameOverScreen(p) {
    p.background(0, 0, 0, 50);
    p.textAlign(p.CENTER);
    p.fill(0, 255, 0);
    p.text("GAME OVER!", p.width / 2, p.height / 2);
}
var sketch = function (p) {
    p.setup = function () {
        p.createCanvas(400, 400);
        state = oneplayer;
        switch (state) {
            case oneplayer:
                snake = new Snake(Math.floor(settings.width / 2), Math.floor(settings.height / 2), Dirs.down);
                candies = new Candies();
                candies.add([snake], settings.candies);
                break;
        }
        p.frameRate(settings.framesPerSec);
    };
    p.draw = function () {
        switch (state) {
            case oneplayer:
                var prevDir_1 = snake.direction;
                handleInput(keyQueue, function (key) {
                    switch (key) {
                        case p.UP_ARROW:
                            if (snake.direction !== Dirs.down)
                                snake.direction = Dirs.up;
                            break;
                        case p.DOWN_ARROW:
                            if (snake.direction !== Dirs.up)
                                snake.direction = Dirs.down;
                            break;
                        case p.LEFT_ARROW:
                            if (snake.direction !== Dirs.right)
                                snake.direction = Dirs.left;
                            break;
                        case p.RIGHT_ARROW:
                            if (snake.direction !== Dirs.left)
                                snake.direction = Dirs.right;
                            break;
                    }
                }, function () { return snake.direction === prevDir_1; });
                if (candies.contains(snake.nextHead)) {
                    candies.remove(snake.nextHead);
                    snake.grow();
                    candies.add([snake]);
                }
                if (!snake.update()) {
                    gameOverScreen(p);
                    state = gameover;
                    break;
                }
                p.background(0);
                candies.draw(p);
                p.fill(200);
                snake.draw(p);
                break;
            case twoplayer:
                break;
            case gameover:
                gameOverScreen(p);
                break;
        }
    };
    var keyQueue = [];
    p.keyPressed = function () {
        keyQueue.push(p.keyCode);
    };
};
var myp5 = new p5(sketch);
//# sourceMappingURL=build.js.map