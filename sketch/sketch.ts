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
// ✔ implement input queue
// * Add player concept
// ✔ unglobalize
// * recomment
// * organize code prior to sketch
// ✔ change == to === unless it has to be ==
// * figure out what to do to the warning about the unused parameter
//   (may be connected to subtyping)
// * move to multiple files
// * find a better place for this todo list
// * write the readme
// * write a keystroke to direction function
// ✔ rewrite state machine with classes
// * change comments to documentation comments onece project is multifile
// * design snake better

// game settings
const settings = {
    width: 25,
    height: 25,
    framesPerSec: 5,
    candies: 1
};

// class for 2d vectors
class Vec {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    // modulus
    public static mod(p: Vec): Vec {
        return new Vec((p.x + settings.width) % settings.width, (p.y + settings.height) % settings.height);
    }

    public static add(p: Vec, d: Vec): Vec {
        return new Vec(p.x + d.x, p.y + d.y);
    }

    public static equals(p: Vec, d: Vec): boolean {
        return p.x === d.x && p.y === d.y;
    }
}

function randInt(l: number, r: number) {
    return Math.floor(Math.random() * (r - l)) + l;
}

// directional constants
class Dirs {
    static up: Vec = new Vec(0, -1);
    static down: Vec = new Vec(0, 1);
    static left: Vec = new Vec(-1, 0);
    static right: Vec = new Vec(1, 0);
}

interface State {
    name: string,
    update: (data: any, name: string) => string,
    data: any,
    init: (data: any) => void
};

class StateMachine {
    previous: string;
    current: string;
    states: Map<string, State>;
    constructor(init: string) {
        this.current = init;
        this.previous = init;
        this.states = new Map<string, State>();
    }

    init() {
        let current = this.states.get(this.current);
        current.init(current.data);
    }

    update(): void {
        this.previous = this.current;
        let current = this.states.get(this.current);
        this.current = current.update(current.data, this.previous);
        if (this.current !== this.previous) {
            let current = this.states.get(this.current);
            current.init(current.data);
        }
    }

    addState(state: State): void {
        this.states.set(state.name, state);
    }
}

class Sprite {
    body: Vec[];
    public update(): void { };
    public draw(p: p5): void { };

    constructor() { this.body = []; }

    public contains(p: Vec): boolean {
        for (let i = 0; i < this.body.length; i++)
            if (this.body[i].x === p.x && this.body[i].y === p.y)
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
    let stateM = new StateMachine('oneplayer');
    stateM.addState({
        name: 'oneplayer',
        update: (data: any, prev: string): string => {
            let prevDir: Vec = data.snake.direction;
            handleInput(keyQueue, (key: number) => {
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

            // clear screen to black
            p.background(0);

            // draw candy
            data.candies.draw(p)

            // draw snake
            p.fill(200);
            data.snake.draw(p);
            return 'oneplayer';
        },
        data: {
            snake: Snake,
            candies: Candies
        },
        init: (data: any) => {
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
    })

    p.setup = () => {
        p.createCanvas(400, 400);

        stateM.init();

        // slowing down framerate
        p.frameRate(settings.framesPerSec);
    };

    // typical p5 draw loop (game loop)
    p.draw = () => {
        stateM.update();
    };

    let keyQueue: number[] = [];

    // p5 keystroke handeling
    p.keyPressed = () => { // WARNING: global variable
        keyQueue.push(p.keyCode);
    }
};

const myp5 = new p5(sketch);
