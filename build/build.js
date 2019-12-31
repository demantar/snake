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
var w = 25;
var h = 25;
var fr = 5;
var ca = 1;
var Vec = (function () {
    function Vec(x, y) {
        this.x = x;
        this.y = y;
    }
    Vec.mod = function (p) {
        return new Vec((p.x + w) % w, (p.y + h) % h);
    };
    Vec.add = function (p, d) {
        return new Vec(p.x + d.x, p.y + d.y);
    };
    Vec.equals = function (p, d) {
        return p.x == d.x && p.y == d.y;
    };
    return Vec;
}());
var up = new Vec(0, -1);
var down = new Vec(0, 1);
var left = new Vec(-1, 0);
var right = new Vec(1, 0);
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
    Sprite.prototype.draw = function () { };
    ;
    Sprite.prototype.contains = function (p) {
        for (var i = 0; i < this.body.length; i++)
            if (this.body[i].x == p.x && this.body[i].y == p.y)
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
    Snake.prototype.draw = function () {
        push();
        for (var i = 1; i < this.body.length; i++)
            drawCell(this.body[i].x, this.body[i].y);
        fill(200);
        drawCell(this.body[0].x, this.body[0].y);
        pop();
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
    Snake.prototype.grow = function () {
        this.body.push(new Vec(-1, -1));
    };
    Object.defineProperty(Snake.prototype, "head", {
        get: function () {
            return this.body[0];
        },
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
    Candies.prototype.draw = function () {
        push();
        fill(255, 0, 0);
        for (var i = 0; i < this.body.length; i++)
            drawCell(this.body[i].x, this.body[i].y);
        pop();
    };
    Candies.prototype.add = function (sprites, q) {
        if (q === void 0) { q = 1; }
        for (var i = 0; i < q; i++) {
            var p = void 0;
            do {
                p = new Vec(floor(random(0, w)), floor(random(0, h)));
            } while (Sprite.isEmpty(sprites, p));
            this.body.push(p);
        }
    };
    Candies.prototype.remove = function (pos) {
        this.body = this.body.filter(function (p) { return !(Vec.equals(p, pos)); });
    };
    return Candies;
}(Sprite));
function drawCell(x, y) {
    rect(width / w * x, height / h * y, width / w, height / h);
}
function gameOverScreen() {
    background(0, 0, 0, 50);
    textAlign(CENTER);
    fill(0, 255, 0);
    text("GAME OVER!", width / 2, height / 2);
}
function setup() {
    createCanvas(400, 400);
    state = oneplayer;
    switch (state) {
        case oneplayer:
            snake = new Snake(floor(w / 2), floor(h / 2), down);
            candies = new Candies();
            candies.add([snake], ca);
            break;
    }
    frameRate(fr);
}
function draw() {
    switch (state) {
        case oneplayer:
            if (candies.contains(snake.nextHead)) {
                candies.remove(snake.nextHead);
                snake.grow();
                candies.add([snake]);
            }
            if (!snake.update()) {
                gameOverScreen();
                state = gameover;
                break;
            }
            background(0);
            candies.draw();
            fill(200);
            snake.draw();
            break;
        case twoplayer:
            break;
        case gameover:
            gameOverScreen();
            break;
    }
}
function keyPressed() {
    switch (keyCode) {
        case UP_ARROW:
            if (snake.direction != down)
                snake.direction = up;
            break;
        case DOWN_ARROW:
            if (snake.direction != up)
                snake.direction = down;
            break;
        case LEFT_ARROW:
            if (snake.direction != right)
                snake.direction = left;
            break;
        case RIGHT_ARROW:
            if (snake.direction != left)
                snake.direction = right;
            break;
    }
}
//# sourceMappingURL=build.js.map