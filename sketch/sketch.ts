//
// ┏━┳━┳┳━┳┳┳━┳┳┳┓
// ┃━┫┃┃┃╻┃┗┫━┫┃┃┃
// ┣━┃┃┃┃╻┃┃┃━╋╋╋┫
// ┗━┻┻━┻┻┻┻┻━┻┻┻┛
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
// * Migrate to p5 vectors
// * unglobalize


// game settings
const w = 25;
const h = 25;
const fr = 5;
const ca = 1;

// class for 2d vectors
// could easilly be replaced by p5's vector
class Vec {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static mod(p: Vec): Vec {
        return new Vec((p.x + w) % w, (p.y + h) % h);
    }

    static add(p: Vec, d: Vec): Vec {
        return new Vec(p.x + d.x, p.y + d.y);
    }

    static equals(p: Vec, d: Vec): boolean {
        return p.x == d.x && p.y == d.y;
    }
}

// directional constants
const up: Vec    = new Vec( 0, -1);
const down: Vec  = new Vec( 0,  1);
const left: Vec  = new Vec(-1,  0);
const right: Vec = new Vec( 1,  0);

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
    update(): void {};
    draw(): void {};

    constructor() {
        this.body = [];
    }

    contains(p: Vec): boolean {
        for (let i = 0; i < this.body.length; i++)
            if (this.body[i].x == p.x && this.body[i].y == p.y)
                return true;
        return false;
    }

    static isEmpty(sprites: Sprite[], p: Vec) {
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

    draw(): void {
        push();
        for (let i = 1; i < this.body.length; i++)
            drawCell(this.body[i].x, this.body[i].y);
        fill(200);
        drawCell(this.body[0].x, this.body[0].y);
        pop();
    };

    update(): boolean {
        let nextHead = Vec.mod(Vec.add(this.body[0], this.direction));
        this.body.pop();
        if (this.contains(nextHead))
            return false;
        this.body.unshift(nextHead);
        return true;
    }

    grow(): void {
        this.body.push(new Vec(-1, -1));
    }

    get head(): Vec {
        return this.body[0];
    }

    get nextHead(): Vec {
        return Vec.mod(Vec.add(this.body[0], this.direction));
    }
}

class Candies extends Sprite {
    draw(): void {
        push();
        fill(255, 0, 0);
        for (let i = 0; i < this.body.length; i++)
            drawCell(this.body[i].x, this.body[i].y);
        pop();
    }

    add(sprites: Sprite[], q: number = 1): void {
        for (let i = 0; i < q; i++) {
            let p: Vec;
            do {
                p = new Vec(floor(random(0, w)), floor(random(0, h)));
            } while (Sprite.isEmpty(sprites, p))
            this.body.push(p);
        }
    }

    remove(pos: Vec): void {
        this.body = this.body.filter(p => !(Vec.equals(p, pos)));
    }
}

// draw cell by grid coordinates x and y
function drawCell(x: number, y: number) {
    rect(width / w * x, height / h * y, width / w, height / h);
}

function gameOverScreen() {
    background(0, 0, 0, 50);
    textAlign(CENTER);
    fill(0, 255, 0);
    text("GAME OVER!", width/2, height/2);
}

// basic p5 setup
function setup() { // WARNING: global variables
    createCanvas(400, 400);

    // state machine setup
    state = oneplayer;

    switch (state) {
        case oneplayer:
            // ingame variable setup
            snake = new Snake(floor(w / 2), floor(h / 2), down);
            candies = new Candies();
            candies.add([snake], ca);
            break;
    }

    // slowing down framerate
    frameRate(fr);
}

// typical p5 draw loop (game loop)
function draw() { // WARNING: global variables
    // check which state the game is in
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

            // clear screen to black
            background(0);

            // draw candy
            candies.draw()

            // draw snake
            fill(200);
            snake.draw();
            break;

        case twoplayer:

            break;

        case gameover:
            // clear screen to black (with fading affect)
            gameOverScreen();
            break;
    }
}

// p5 keystroke handeling
function keyPressed() { // WARNING: global variable
    // check which key is pressed and change direction accordingly
    // also checks if you are turning around whitch is ignored
    switch (keyCode) {
        case UP_ARROW:
            if (snake.direction != down) snake.direction = up;
            break;
        case DOWN_ARROW:
            if (snake.direction != up) snake.direction = down;
            break;
        case LEFT_ARROW:
            if (snake.direction != right) snake.direction = left;
            break;
        case RIGHT_ARROW:
            if (snake.direction!= left) snake.direction = right;
            break;
    }
}
