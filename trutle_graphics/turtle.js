const fs = require("fs");
const NORTH = 0;
const EAST = 1;
const SOUTH = 2;
const WEST = 3;
// Returns a 2D array of `width` and `height` optionally
// filled with a `fillChar` defaulted to " ".
function create2DArray(width, height, fillChar = " ") {
  return Array.from({
    length: height
  }).map(() =>
    Array.from({
      length: width
    }).map(() => fillChar)
  );
}
// Takes a number `n`, returns `true` if negative, `false` otherwise.
function isNegative(n) {
  return n < 0;
}
// Returns an array containing integers beginning at `begin` and ending at
// `end`. `begin` can be smaller than `end`. Accepts negatives.
function range(begin, end, step = 1) {
  let arr = [];
  const direction = (end - begin) / Math.abs(end - begin);
  for (
    let i = begin; isNegative(direction) ? i >= end : i <= end; i += direction * step
  ) {
    arr.push(i);
  }
  return arr;
}
// Calculates the bottom right point of the drawing surface and returns as an
// array of integers. (e.g. [5, 5])
function getBottomRight(points) {
  return points.reduce(
    ([maxX, maxY], [cX, cY]) => [Math.max(maxX, cX), Math.max(maxY, cY)],
    [0, 0]
  );
}
class Turtle {
  constructor(x = 0, y = 0) {
    this.steps = [
      [x, y]
    ];
    this.facing = EAST;
  }
  lastPoint() {
    return this.steps[this.steps.length - 1];
  }
  forward(n) {
    const [lX, lY] = this.lastPoint();
    switch (this.facing) {
      case NORTH:
        this.steps.push([lX, lY - n]);
        break;
      case EAST:
        this.steps.push([lX + n, lY]);
        break;
      case SOUTH:
        this.steps.push([lX, lY + n]);
        break;
      case WEST:
        this.steps.push([lX - n, lY]);
        break;
    }
    return this;
  }
  right() {
    this.facing = (this.facing + 1) % 4;
    return this;
  }
  left() {
    this.facing = (this.facing + 3) % 4;
    return this;
  }
  allPoints() {
    let points = [];
    for (let i = 1; i < this.steps.length; i += 1) {
      const [bX, bY] = this.steps[i - 1];
      const [lX, lY] = this.steps[i];
      if (points.length > 0) {
        points.pop();
      }
      if (lX - bX === 0) {
        range(bY, lY)
          .map(y => [lX, y])
          .forEach(point => points.push(point));
      } else {
        range(bX, lX)
          .map(x => [x, lY])
          .forEach(point => points.push(point));
      }
    }
    return points;
  }
  draw(foreground = "•", background = " ") {
    const points = this.allPoints();
    const drawingPad = create2DArray(
      ...getBottomRight(points).map(x => x + 1),
      background
    );
    for (let [x, y] of this.allPoints()) {
      drawingPad[y][x] = foreground;
    }
    return drawingPad;
  }
  toString() {
    return this.draw()
      .map(chars => chars.join(""))
      .join("\n");
  }
  print() {
    console.log(this.toString());
  }
}
// Stretches
// Adding colors to terminal output
const esc = {
  bold: `\x1b[1m`,
  reset: `\x1b[0m`
};
const args = process.argv.slice(2);
if (args.length > 0) {
  // Get turtle commands from args
  let commands = args.find(arg => !arg.startsWith("--"));
  // Get outputOption from args
  let outputOption = args.find(arg => arg.startsWith("--output"));
  // Translate turtle commands to turtle drawing
  let turtle = commands.split("-").reduce((turtle, rawCommand) => {
    const command = rawCommand[0].toLowerCase();
    const args = rawCommand.slice(1);
    switch (command) {
      case "t":
        return new Turtle(...args.split(",").map(n => parseInt(n, 10)));
      case "f":
        return turtle.forward(parseInt(args, 10));
      case "r":
        return turtle.right();
      case "l":
        return turtle.left();
      default:
        return turtle;
    }
  }, new Turtle(0, 0));
  // Save to file or print
  if (outputOption) {
    let [, filename] = outputOption.split("=");
    fs.writeFile(filename, turtle.toString(), error => {
      console.log(
        `🐢 Turtle graphics saved to ${esc.bold + filename + esc.reset}`
      );
    });
  } else {
    turtle.print();
  }
}