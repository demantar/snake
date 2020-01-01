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

function randInt(l: number, r: number) {
    return Math.floor(Math.random() * (r - l)) + l;
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
    draw(p: p5): void {};

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

    draw(p: p5): void {
        p.push();
        for (let i = 1; i < this.body.length; i++)
            drawCell(p, this.body[i].x, this.body[i].y);
        p.fill(200);
        drawCell(p, this.body[0].x, this.body[0].y);
        p.pop();
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
    draw(p: p5): void {
        p.push();
        p.fill(255, 0, 0);
        for (let i = 0; i < this.body.length; i++)
            drawCell(p, this.body[i].x, this.body[i].y);
        p.pop();
    }

    add(sprites: Sprite[], q: number = 1): void {
        for (let i = 0; i < q; i++) {
            let p: Vec;
            do {
                p = new Vec(randInt(0, w), randInt(0, h));
            } while (Sprite.isEmpty(sprites, p))
            this.body.push(p);
        }
    }

    remove(pos: Vec): void {
        this.body = this.body.filter(p => !(Vec.equals(p, pos)));
    }
}

// draw cell by grid coordinates x and y
function drawCell(p: p5, x: number, y: number) {
    p.rect(p.width / w * x, p.height / h * y, p.width / w, p.height / h);
}

function gameOverScreen(p: p5) {
    p.background(0, 0, 0, 50);
    p.textAlign(CENTER);
    p.fill(0, 255, 0);
    p.text("GAME OVER!", width/2, height/2);
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
                snake = new Snake(Math.floor(w / 2), Math.floor(h / 2), down);
                candies = new Candies();
                candies.add([snake], ca);
                break;
        }

        // slowing down framerate
        p.frameRate(fr);
    }

    // typical p5 draw loop (game loop)
    p.draw = () => { // WARNING: global variables
        // check which state the game is in
        switch (state) {
            case oneplayer:
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
    }

    // p5 keystroke handeling
    p.keyPressed = () => { // WARNING: global variable
        // check which key is pressed and change direction accordingly
        // also checks if you are turning around whitch is ignored
        switch (p.keyCode) {
            case p.UP_ARROW:
                if (snake.direction != down) snake.direction = up;
                break;
            case p.DOWN_ARROW:
                if (snake.direction != up) snake.direction = down;
                break;
            case p.LEFT_ARROW:
                if (snake.direction != right) snake.direction = left;
                break;
            case p.RIGHT_ARROW:
                if (snake.direction!= left) snake.direction = right;
                break;
        }
    }
}

const myp5 = new p5(sketch);
