//
//   ____              _
//  / ___| _ __   __ _| | _____
//  \___ \| '_ \ / _` | |/ / _ \
//   ___) | | | | (_| |   <  __/
//  |____/|_| |_|\__,_|_|\_\___|
//
//
// By Benedikt Vilji Magnússon
//
// TODO:
// ✔ Handle walls
// ✔ Sandardize points
// ✔ Think more about candy generation location
// * Add UI
// * implement input queue
// * Add player concept
// * Migrate to p5 vectors (might have changed my mind)
// ✔ unglobalize
// * recomment
// * organize code prior to sketch
// * change == to === unless it has to be ==
// * figure out what to do to the warning about the unused paraeter
//   (may be connected to subtyping)

// game settings
const settings = {
    width: 25,
    height: 25,
    framesPerSec: 5,
    candies: 1
};

// class for 2d vectors
// could easilly be replaced by p5's vector
class Vec {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public static mod(p: Vec): Vec {
        return new Vec((p.x + settings.width) % settings.width, (p.y + settings.height) % settings.height);
    }

    public static add(p: Vec, d: Vec): Vec {
        return new Vec(p.x + d.x, p.y + d.y);
    }

    public static equals(p: Vec, d: Vec): boolean {
        return p.x == d.x && p.y == d.y;
    }
}

function randInt(l: number, r: number) {
    return Math.floor(Math.random() * (r - l)) + l;
}

// directional constants
class Dirs { }
const up: Vec = new Vec(0, -1);
const down: Vec = new Vec(0, 1);
const left: Vec = new Vec(-1, 0);
const right: Vec = new Vec(1, 0);

// state machine
const oneplayer = 0;
const gameover = 1;
const twoplayer = 2;
let state: number;

// ingame state
let snake: Snake;
let candies: Candies;

class Sprite {
    body: Vec[];
    public update(): void { };
    public draw(p: p5): void { };

    constructor() { this.body = []; }

    public contains(p: Vec): boolean {
        for (let i = 0; i < this.body.length; i++)
            if (this.body[i].x == p.x && this.body[i].y == p.y)
                return true;
        return false;
    }

    public static isEmpty(sprites: Sprite[], p: Vec) {
        for (let i = 0; i < sprites.length; i++)
            if (sprites[i].contains(p))
                return true;
        return false;
    }
}

class Snake extends Sprite {
    direction: Vec;
    constructor(x: number, y: number, d: Vec) {
        super();
        this.direction = d;
        this.body.push(new Vec(x, y));
    }

    public draw(p: p5): void {
        p.push();
        for (let i = 1; i < this.body.length; i++)
            drawCell(p, this.body[i].x, this.body[i].y);
        p.fill(200);
        drawCell(p, this.body[0].x, this.body[0].y);
        p.pop();
    };

    public update(): boolean {
        let nextHead = Vec.mod(Vec.add(this.body[0], this.direction));
        this.body.pop();
        if (this.contains(nextHead))
            return false;
        this.body.unshift(nextHead);
        return true;
    }

    public grow(): void { this.body.push(new Vec(-1, -1)); }

    public get head(): Vec { return this.body[0]; }

    public get nextHead(): Vec {
        return Vec.mod(Vec.add(this.body[0], this.direction));
    }
}

class Candies extends Sprite {
    public draw(p: p5): void {
        p.push();
        p.fill(255, 0, 0);
        for (let i = 0; i < this.body.length; i++)
            drawCell(p, this.body[i].x, this.body[i].y);
        p.pop();
    }

    public add(sprites: Sprite[], q: number = 1): void {
        for (let i = 0; i < q; i++) {
            let p: Vec;
            do {
                p = new Vec(randInt(0, settings.width), randInt(0, settings.height));
            } while (Sprite.isEmpty(sprites, p)) this.body.push(p);
        }
    }

    remove(pos: Vec): void {
        this.body = this.body.filter(p => !(Vec.equals(p, pos)));
    }
}

function handleInput(queue: number[], f: (arg0: number) => void,
    repf: () => boolean = () => false) {
    let k = queue.shift()
    f(k);
    if (queue.length > 0 && repf())
        handleInput(queue, f, repf);
    return queue;
}

// draw cell by grid coordinates x and y
function drawCell(p: p5, x: number, y: number) {
    let w = settings.width, h = settings.height;
    p.rect(p.width / w * x, p.height / h * y, p.width / w, p.height / h);
}

function gameOverScreen(p: p5) {
    p.background(0, 0, 0, 50);
    p.textAlign(p.CENTER);
    p.fill(0, 255, 0);
    p.text("GAME OVER!", p.width / 2, p.height / 2);
}

const sketch = (p: p5) => {
    // basic p5 setup
    p.setup = () => {
        p.createCanvas(400, 400);

        // state machine setup
        state = oneplayer;

        switch (state) {
            case oneplayer:
                // ingame variable setup
                snake = new Snake(Math.floor(settings.width / 2), Math.floor(settings.height / 2), down);
                candies = new Candies();
                candies.add([snake], settings.candies);
                break;
        }

        // slowing down framerate
        p.frameRate(settings.framesPerSec);
    };

    // typical p5 draw loop (game loop)
    p.draw = () => {
        // check which state the game is in
        switch (state) {
            case oneplayer:
                let prevDir: Vec = snake.direction;
                handleInput(keyQueue, (key: number) => {
                    switch (key) {
                        case p.UP_ARROW:
                            if (snake.direction != down)
                                snake.direction = up;
                            break;
                        case p.DOWN_ARROW:
                            if (snake.direction != up)
                                snake.direction = down;
                            break;
                        case p.LEFT_ARROW:
                            if (snake.direction != right)
                                snake.direction = left;
                            break;
                        case p.RIGHT_ARROW:
                            if (snake.direction != left)
                                snake.direction = right;
                            break;
                    }
                }, () => snake.direction == prevDir);

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

                // clear screen to black
                p.background(0);

                // draw candy
                candies.draw(p)

                // draw snake
                p.fill(200);
                snake.draw(p);
                break;

            case twoplayer:

                break;

            case gameover:
                // clear screen to black (with fading affect)
                gameOverScreen(p);
                break;
        }
    };

    let keyQueue: number[] = [];

    // p5 keystroke handeling
    p.keyPressed = () => { // WARNING: global variable
        keyQueue.push(p.keyCode);
    }
};

const myp5 = new p5(sketch);
