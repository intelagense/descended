let Game = {
    display: null,
    engine: null,

    init: function () {
        this.display = new ROT.Display();
        document.body.appendChild(this.display.getContainer());
        this._generateMap();
        let scheduler = new ROT.Scheduler.Simple();
        scheduler.add(this.player, true);
        this.engine = new ROT.Engine(scheduler);
        this.engine.start();
    }
}

Game.map = {};
Game._generateMap = function () {
    let digger = new ROT.Map.Digger();
    let freeCells = [];

    let digCallback = function (x, y, value) {
        if (value) { return; } //do not store walls

        let key = `${x},${y}`
        freeCells.push(key);
        this.map[key] = "⢕";
    }
    digger.create(digCallback.bind(this));

    this._generateArtifacts(freeCells)

    this._drawWholeMap()

    this._createPlayer(freeCells);
}

Game._generateArtifacts = function (freeCells) {
    for (let i = 0; i < 10; i++) {
        let index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        let key = freeCells.splice(index, 1)[0];
        this.map[key] = "*"
    }
}

Game._drawWholeMap = function () {
    for (let key in this.map) {
        let parts = key.split(",");
        let x = parseInt(parts[0]);
        let y = parseInt(parts[1]);
        this.display.draw(x, y, this.map[key]);
    }
}

//Player code
let Player = function (x, y) {
    this._x = x;
    this._y = y;
    this._draw();
}

Player.prototype._draw = function () {
    Game.display.draw(this._x, this._y, "@", "#ff0")
}

Game.player = null;

Game._createPlayer = function (freeCells) {
    let index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
    let key = freeCells.splice(index, 1)[0];
    let parts = key.split(",");
    let x = parseInt(parts[0]);
    let y = parseInt(parts[1]);
    this.player = new Player(x, y);
}

Player.prototype.act = function () {
    Game.engine.lock();
    window.addEventListener("keydown", this);
}

Player.prototype.handleEvent = function (e) {
    e.preventDefault() //prevents arrow keys from functioning
    let keyMap = {}
    keyMap[33] = 1; // PageUp
    keyMap[34] = 3; // PageDown
    keyMap[35] = 5; // End
    keyMap[36] = 7; // Home
    keyMap[37] = 6; // ArrowLeft
    keyMap[38] = 0; // ArrowUp
    keyMap[39] = 2; // ArrowRight
    keyMap[40] = 4; // ArrowDown

    let code = e.keyCode;

    if (!(code in keyMap)) { return; }

    let diff = ROT.DIRS[8][keyMap[code]];
    let newX = this._x + diff[0];
    let newY = this._y + diff[1];

    let newKey = `${newX},${newY}`;
    if (!(newKey in Game.map)) { return; }

    Game.display.draw(this._x, this._y, Game.map[`${this._x},${this._y}`]);
    this._x = newX;
    this._y = newY;
    this._draw();
    window.removeEventListener("keydown", this);
    Game.engine.unlock()
}

