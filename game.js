'use strict'

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  plus(nextVector) {
    if (!Vector.prototype.isPrototypeOf(nextVector)) {
      throw new Error('Можно прибавлять к вектору только вектор типа Vector');
    }
    let newVector = new Vector();
    newVector.x = this.x + nextVector.x;
    newVector.y = this.y + nextVector.y;
    return newVector;
  }

  times(multiplier) {
    let newVector = new Vector();
    newVector.x = this.x * multiplier;
    newVector.y = this.y * multiplier;
    return newVector;
  }
}

class Actor {
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
    if (
      Vector.prototype.isPrototypeOf(pos) !== true || 
      Vector.prototype.isPrototypeOf(size) !== true || 
      Vector.prototype.isPrototypeOf(speed) !== true
    ) {
      throw ('Можно использовать только объект типа Vector');
    }

    this.pos = pos;
    this.size = size;
    this.speed = speed;
  }

  get type() {
    return 'actor';
  }

  get left() {
    return this.pos.x;
  }

  get top() {
    return this.pos.y;
  }

  get right() {
    return this.pos.x + this.size.x;
  }

  get bottom() {
    return this.pos.y + this.size.y;
  }

  act() { };

  isIntersect(item) {
    if (Actor.prototype.isPrototypeOf(item) !== true || arguments.length === 0) {
      throw ('Необходимо использовать только объект типа Actor с аргументами!');
    } else if (item !== this) {
      return (!
          (
            this.top > item.bottom || 
            this.bottom < item.top || 
            this.right < item.left || 
            this.left > item.right
          )
        );
    }
  }
}

class Level {
  constructor(grid, actors) {
    this.grid = grid;
    this.actors = actors;

    for (let i = 0; i < this.actors.length; i++) {
      if (this.actors[i].type === 'player') {
        this.player = this.actors[i];
      }
    }

    this.height = grid.length;

    let maxWidth = [];
    for (let i = 0; i < this.grid.length; i++) {
      maxWidth.push(this.grid[i].length);
    }
    this.width = Math.max(...maxWidth);

    this.status = null;
    this.finishDelay = 1;

    this.gridItems = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.grid[y][x] !== undefined) {
          this.gridItems.push(
            new Actor(new Vector(x, y),
            new Vector(1, 1),
            new Vector(0, 0))
          );
        }
      }
    }
  }

  isFinished() {
    return this.status !== null && this.finishDelay < 0;
  }

  actorAt(actor) {
    if ((
      Actor.prototype.isPrototypeOf(actor) !== true && 
      Actor.isPrototypeOf(actor) !== true) || 
      arguments.length === 0
    ) {
      throw ('Необходимо использовать только объект типа Actor с аргументами!');
    } else {
      for (let i = 0; i < this.actors.length; i++) {
        if (actor.isIntersect(this.actors[i])) {
          return this.actors[i];
        }
      }
      return undefined;
    }
  }

 obstacleAt(toMove, size) {
    if (
      Vector.prototype.isPrototypeOf(toMove) !== true ||
      Vector.prototype.isPrototypeOf(size) !== true
    ) {
      throw ('Необходимо использовать только объект типа Actor с аргументами!');
    }
    
    let newObject = new Actor(toMove, size);
    for (let y = newObject.top; y < newObject.bottom; y++) {
      if (y > this.height - 1) {
          return 'lava'
      }
      for (let x = newObject.left; x < newObject.right; x++) {
        if (y < 0 || x < 0 || x > this.width - 1) {
          return 'wall';
        }

        for (let i = 0; i < this.gridItems.length; i++) {
          if (newObject.isIntersect(this.gridItems[i])) {
            return this.grid[this.gridItems[i].pos.y][this.gridItems[i].pos.x];
          }
        }
        return;
      }
    }
  }

  removeActor(actor) {
    if (
      Actor.prototype.isPrototypeOf(actor) !== true && 
      Actor.isPrototypeOf(actor) !== true
    ) {
      throw ('Необходимо использовать только объект типа Actor!');
    }
    if (this.actors.indexOf(actor) !== -1) {
      this.actors.splice(this.actors.indexOf(actor), 1);
    }
  }

  noMoreActors(type) {
    return this.actors.every(function(element) {
      return element.type !== type;
    })
  }

  playerTouched(type, actor) {
      if (
        type === 'lava' || 
        type === 'fireball' &&
        this.status === null
      ) 
      {
        this.status = 'lost';
      } else if ((
        Actor.prototype.isPrototypeOf(actor) === true || 
        Actor.isPrototypeOf(actor) === true) && 
        type === 'coin'  && 
        this.status === null
      ) 
      {
        this.removeActor(actor);
        if (this.noMoreActors(type)) {
          this.status = 'won';
        }
      }
    }
  
}

class LevelParser {
  constructor(actorsDict) {
    this.actorsDict = actorsDict;
  }

  actorFromSymbol(char) {
    return parser.actorsDict[char]
  }

  obstacleFromSymbol(char) {
    switch (char) {
      case 'x':
        return 'wall';
        break;

      case '!':
        return 'lava';
        break;

      default:
        return;
    }
  }

  createGrid(grid) {
    let obstacleFromSymbol = this.obstacleFromSymbol;
    return grid.map(function (string) {
      return string.split("").map(function (char) {
        return obstacleFromSymbol(char);
      });
    });
  }

  createActors(actorStrings) {
    let actors = [];
    for (let y = 0; y < actorStrings.length; y++) {
      let actorStringsArr = actorStrings[y].split("");
      for (let x = 0; x < actorStringsArr.length; x++) {
        let actorConst = this.actorFromSymbol(actorStringsArr[x]);
        let actor;
        if (actorConst !== undefined) {
          actor = new actorConst(new Vector(x, y));
        }
        if (
          Actor.prototype.isPrototypeOf(actor) === true ||
          Actor.isPrototypeOf(actor) === true
        ) {
          actors.push(actor);
        }
      }
    }
    return actors;
  }

  parse(levelStrings) {
    let actors = this.createActors(levelStrings);
    let grid = this.createGrid(levelStrings);
    return new Level(grid, actors);
  }

}

class Fireball extends Actor {
  constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
    super(pos, speed);
    if (
      Vector.prototype.isPrototypeOf(pos) !== true || 
      Vector.prototype.isPrototypeOf(speed) !== true
    ) {
      throw ('Можно использовать только объект типа Vector');
    }

    this.pos = pos;
    this.speed = speed;

    this.size = new Vector(1, 1);
  }

  get type() {
    return 'fireball';
  }

  getNextPosition(time = 1) {
    return this.pos.plus(this.speed.times(time));
  }

  handleObstacle() {
    this.speed.x = this.speed.x + 2 * this.speed.x * (-1);
    this.speed.y = this.speed.y + 2 * this.speed.y * (-1);
  }

  act(time, level) {
    let nextPosition = this.getNextPosition(time);
    if (level.obstacleAt(nextPosition, this.size) === undefined) {
      this.pos = nextPosition;
    } else {
      this.handleObstacle();
    }
  }
}

class HorizontalFireball extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    super(pos);
    if (Vector.prototype.isPrototypeOf(pos) !== true) {
      throw ('Можно использовать только объект типа Vector');
    }

    this.pos = pos;
    this.speed = new Vector(2, 0);
    this.size = new Vector(1, 1);
  }
}

class VerticalFireball extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    super(pos);
    if (Vector.prototype.isPrototypeOf(pos) !== true) {
      throw ('Можно использовать только объект типа Vector');
    }

    this.pos = pos;
    this.speed = new Vector(0, 2);
    this.size = new Vector(1, 1);
  }
}

class FireRain extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    super(pos);
    if (Vector.prototype.isPrototypeOf(pos) !== true) {
      throw ('Можно использовать только объект типа Vector');
    }
    const startPos = new Vector(pos.x, pos.y);

    this.pos = pos;
    this.speed = new Vector(0, 3);
    this.size = new Vector(1, 1);
    this.startPos = startPos;
  }

  act(time, level) {
    let nextPosition = this.getNextPosition(time);
    if (level.obstacleAt(nextPosition, this.size) === undefined) {
      this.pos = nextPosition;
    } else {
      this.pos = this.startPos;
    }
  }
}

class Coin extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super(pos);
    if (Vector.prototype.isPrototypeOf(pos) !== true) {
      throw ('Можно использовать только объект типа Vector');
    }

    this.pos = pos.plus(new Vector(0.2, 0.1));
    this.size = new Vector(0.6, 0.6);

    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * Math.PI;
    this.startPos = new Vector(this.pos.x, this.pos.y);
  }

  get type() {
    return 'coin';
  }

  updateSpring(time = 1) {
    this.spring = this.spring + this.springSpeed * time;
  }

  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }

  getNextPosition(time = 1) {
    this.updateSpring(time);
    let springVector = new Vector(this.startPos.x, this.startPos.y);
    return springVector.plus(this.getSpringVector());
  }

  act(time) {
    this.pos = this.getNextPosition(time);
  }
}

class Player extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super(pos);
    if (Vector.prototype.isPrototypeOf(pos) !== true) {
      throw ('Можно использовать только объект типа Vector');
    }

    this.pos = pos.plus(new Vector(0, -0.5));
    this.size = new Vector(0.8, 1.5);
    this.speed = new Vector(0, 0);
  }

  get type() {
    return 'player';
  }
}

const schemas = [
  [
    "     v                 ",
    "                       ",
    "                       ",
    "                       ",
    "                       ",
    "  |xxx       w         ",
    "                    o  ",
    "  o               = x  ",
    "  x          o o    x  ",
    "  x  @    *  xxxxx  x  ",
    "  xxxxx             x  ",
    "      x!!!!!!!!!!!!!x  ",
    "      xxxxxxxxxxxxxxx  ",
    "                       "
  ],
  [
    "     v                 ",
    "                       ",
    "                       ",
    "                       ",
    "                       ",
    "  |                    ",
    "  o                 o  ",
    "  x               = x  ",
    "  x          o o    x  ",
    "  x  @       xxxxx  x  ",
    "  xxxxx             x  ",
    "      x!!!!!!!!!!!!!x  ",
    "      xxxxxxxxxxxxxxx  ",
    "                       "
  ],
  [
    "        |           |  ",
    "                       ",
    "                       ",
    "                       ",
    "                       ",
    "                       ",
    "                       ",
    "                       ",
    "                       ",
    "     |                 ",
    "                       ",
    "         =      |      ",
    " @ |  o            o   ",
    "xxxxxxxxx!!!!!!!xxxxxxx",
    "                       "
  ],
  [
    "                       ",
    "                       ",
    "                       ",
    "    o                  ",
    "    x      | x!!x=     ",
    "         x             ",
    "                      x",
    "                       ",
    "                       ",
    "                       ",
    "               xxx     ",
    "                       ",
    "                       ",
    "       xxx  |          ",
    "                       ",
    " @                     ",
    "xxx                    ",
    "                       "
  ], 
  [
    "   v         v",
    "              ",
    "         !o!  ",
    "              ",
    "              ",
    "              ",
    "              ",
    "         xxx  ",
    "          o   ",
    "        =     ",
    "  @           ",
    "  xxxx        ",
    "  |           ",
    "      xxx    x",
    "              ",
    "          !   ",
    "              ",
    "              ",
    " o       x    ",
    " x      x     ",
    "       x      ",
    "      x       ",
    "   xx         ",
    "              "
  ]
];

const actorDict = {
  '@': Player,
  'o': Coin,
  '=': HorizontalFireball,
  '|': VerticalFireball,
  'v': FireRain
};

const parser = new LevelParser(actorDict);
try {
  runGame(schemas, parser, DOMDisplay)
    .then(() => alert('Вы выиграли приз!'));
} catch (e) {
  console.log(e);
}


// Тесты класса Vector
/*
const start = new Vector(30, 50);
const moveTo = new Vector(5, 10);
const finish = start.plus(moveTo.times(2));

console.log(`Исходное расположение: ${start.x}:${start.y}`);
console.log(`Текущее расположение: ${finish.x}:${finish.y}`);
*/

// Тесты класса Actor
/*
const items = new Map();
const player = new Actor();
items.set('Игрок', player);
items.set('Первая монета', new Actor(new Vector(10, 10)));
items.set('Вторая монета', new Actor(new Vector(15, 5)));

function position(item) {
  return ['left', 'top', 'right', 'bottom']
    .map(side => `${side}: ${item[side]}`)
    .join(', ');  
}

function movePlayer(x, y) {
  player.pos = player.pos.plus(new Vector(x, y));
}

function status(item, title) {
  console.log(`${title}: ${position(item)}`);
  if (player.isIntersect(item)) {
    console.log(`Игрок подобрал ${title}`);
  }
}

items.forEach(status);
movePlayer(10, 10);
items.forEach(status);
movePlayer(5, -5);
items.forEach(status);
*/

// Тесты класса Level
/*
const grid = [
  [undefined, undefined],
  ['wall', 'wall']
];

function MyCoin(title) {
  this.type = 'coin';
  this.title = title;
}
MyCoin.prototype = Object.create(Actor);
MyCoin.constructor = MyCoin;

const goldCoin = new MyCoin('Золото');
const bronzeCoin = new MyCoin('Бронза');
const player = new Actor();
const fireball = new Actor();

const level = new Level(grid, [ goldCoin, bronzeCoin, player, fireball ]);

level.playerTouched('coin', goldCoin);
level.playerTouched('coin', bronzeCoin);

if (level.noMoreActors('coin')) {
  console.log('Все монеты собраны');
  console.log(`Статус игры: ${level.status}`);
}

const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
if (obstacle) {
  console.log(`На пути препятствие: ${obstacle}`);
}

const otherActor = level.actorAt(player);
if (otherActor === fireball) {
  console.log('Пользователь столкнулся с шаровой молнией');
}
*/

// Тесты класса Fireball
/*
const time = 5;
const speed = new Vector(1, 0);
const position = new Vector(5, 5);

const ball = new Fireball(position, speed);

const nextPosition = ball.getNextPosition(time);
console.log(`Новая позиция: ${nextPosition.x}: ${nextPosition.y}`);

ball.handleObstacle();
console.log(`Текущая скорость: ${ball.speed.x}: ${ball.speed.y}`);
*/
