const settings = {
    width: 25,
    height: 25,
    framesPerSec: 5,
    candies: 1
};
class Vec {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static mod(p) {
        return new Vec((p.x + settings.width) % settings.width, (p.y + settings.height) % settings.height);
    }
    static add(p, d) {
        return new Vec(p.x + d.x, p.y + d.y);
    }
    static equals(p, d) {
        return p.x === d.x && p.y === d.y;
    }
}
function randInt(l, r) {
    return Math.floor(Math.random() * (r - l)) + l;
}
class Dirs {
}
Dirs.up = new Vec(0, -1);
Dirs.down = new Vec(0, 1);
Dirs.left = new Vec(-1, 0);
Dirs.right = new Vec(1, 0);
;
class StateMachine {
    constructor(init) {
        this.current = init;
        this.previous = init;
        this.states = new Map();
    }
    init() {
        let current = this.states.get(this.current);
        current.init(current.data);
    }
    update() {
        this.previous = this.current;
        let current = this.states.get(this.current);
        this.current = current.update(current.data, this.previous);
        if (this.current !== this.previous) {
            let current = this.states.get(this.current);
            current.init(current.data);
        }
    }
    addState(state) {
        this.states.set(state.name, state);
    }
}
class Sprite {
    constructor() { this.body = []; }
    update() { }
    ;
    draw(p) { }
    ;
    contains(p) {
        for (let i = 0; i < this.body.length; i++)
            if (this.body[i].x === p.x && this.body[i].y === p.y)
                return true;
        return false;
    }
    static isEmpty(sprites, p) {
        for (let i = 0; i < sprites.length; i++)
            if (sprites[i].contains(p))
                return true;
        return false;
    }
}
class Snake extends Sprite {
    constructor(x, y, d) {
        super();
        this.direction = d;
        this.body.push(new Vec(x, y));
    }
    draw(p) {
        p.push();
        for (let i = 1; i < this.body.length; i++)
            drawCell(p, this.body[i].x, this.body[i].y);
        p.fill(200);
        drawCell(p, this.body[0].x, this.body[0].y);
        p.pop();
    }
    ;
    update() {
        let nextHead = Vec.mod(Vec.add(this.body[0], this.direction));
        this.body.pop();
        if (this.contains(nextHead))
            return false;
        this.body.unshift(nextHead);
        return true;
    }
    grow() { this.body.push(new Vec(-1, -1)); }
    get head() { return this.body[0]; }
    get nextHead() {
        return Vec.mod(Vec.add(this.body[0], this.direction));
    }
}
class Candies extends Sprite {
    draw(p) {
        p.push();
        p.fill(255, 0, 0);
        for (let i = 0; i < this.body.length; i++)
            drawCell(p, this.body[i].x, this.body[i].y);
        p.pop();
    }
    add(sprites, q = 1) {
        for (let i = 0; i < q; i++) {
            let p;
            do {
                p = new Vec(randInt(0, settings.width), randInt(0, settings.height));
            } while (Sprite.isEmpty(sprites, p));
            this.body.push(p);
        }
    }
    remove(pos) {
        this.body = this.body.filter(p => !(Vec.equals(p, pos)));
    }
}
function handleInput(queue, f, repf = () => false) {
    let k = queue.shift();
    f(k);
    if (queue.length > 0 && repf())
        handleInput(queue, f, repf);
    return queue;
}
function drawCell(p, x, y) {
    let w = settings.width, h = settings.height;
    p.rect(p.width / w * x, p.height / h * y, p.width / w, p.height / h);
}
function gameOverScreen(p) {
    p.background(0, 0, 0, 50);
    p.textAlign(p.CENTER);
    p.fill(0, 255, 0);
    p.text("GAME OVER!", p.width / 2, p.height / 2);
}
const sketch = (p) => {
    let stateM = new StateMachine('oneplayer');
    stateM.addState({
        name: 'oneplayer',
        update: (data, prev) => {
            let prevDir = data.snake.direction;
            handleInput(keyQueue, (key) => {
                switch (key) {
                    case p.UP_ARROW:
                        if (data.snake.direction !== Dirs.down)
                            data.snake.direction = Dirs.up;
                        break;
                    case p.DOWN_ARROW:
                        if (data.snake.direction !== Dirs.up)
                            data.snake.direction = Dirs.down;
                        break;
                    case p.LEFT_ARROW:
                        if (data.snake.direction !== Dirs.right)
                            data.snake.direction = Dirs.left;
                        break;
                    case p.RIGHT_ARROW:
                        if (data.snake.direction !== Dirs.left)
                            data.snake.direction = Dirs.right;
                        break;
                }
            }, () => data.snake.direction === prevDir);
            if (data.candies.contains(data.snake.nextHead)) {
                data.candies.remove(data.snake.nextHead);
                data.snake.grow();
                data.candies.add([data.snake]);
            }
            if (!data.snake.update()) {
                return 'gameover';
            }
            p.background(0);
            data.candies.draw(p);
            p.fill(200);
            data.snake.draw(p);
            return 'oneplayer';
        },
        data: {
            snake: Snake,
            candies: Candies
        },
        init: (data) => {
            data.snake = new Snake(Math.floor(settings.width / 2), Math.floor(settings.height / 2), Dirs.down);
            data.candies = new Candies();
            data.candies.add([data.snake], settings.candies);
        }
    });
    stateM.addState({
        name: 'gameover',
        update: () => {
            gameOverScreen(p);
            return 'gameover';
        },
        data: null,
        init: () => {
            gameOverScreen(p);
        }
    });
    p.setup = () => {
        p.createCanvas(400, 400);
        stateM.init();
        p.frameRate(settings.framesPerSec);
    };
    p.draw = () => {
        stateM.update();
    };
    let keyQueue = [];
    p.keyPressed = () => {
        keyQueue.push(p.keyCode);
    };
};
const myp5 = new p5(sketch);
//# sourceMappingURL=build.js.map