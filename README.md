# Daily Dungeons and Diagrams

A single-page web application that serves daily shareable puzzles. Decode hallways, monsters, and treasures.


### Instructions to Play

Fill in the walls of the dungeon.

The number of walls in each row/column is written at the side.

    ⬜️1️⃣2️⃣3️⃣           ⬜️1️⃣2️⃣3️⃣
    1️⃣⬜️🐍⬜️           1️⃣⬜️🐍🟫
    2️⃣🐍⬜️⬜️           2️⃣🐍🟫🟫
    3️⃣⬜️⬜️⬜️           3️⃣🟫🟫🟫

Every monster is in a dead-end, and every dead-end has a monster.

    ⬜️1️⃣0️⃣1️⃣           ⬜️1️⃣0️⃣1️⃣
    0️⃣🐀⬜️🐀           0️⃣🐀⬜️🐀
    2️⃣⬜️⬜️⬜️           2️⃣🟫⬜️🟫
    0️⃣🐀⬜️🐀           0️⃣🐀⬜️🐀

Every treasure is in a 3x3 room with exactly one exit.  
(The treasure can be anywhere in the room.)  
(Types of treasures: `💎👑💍🏆🥇🥈🥉🏅🎖🔮🎁📦tT`)

    ⬜️0️⃣5️⃣2️⃣2️⃣2️⃣4️⃣0️⃣    ⬜️0️⃣5️⃣2️⃣2️⃣2️⃣4️⃣0️⃣
    5️⃣🐀⬜️⬜️⬜️⬜️⬜️🐀    5️⃣🐀🟫🟫🟫🟫🟫🐀
    2️⃣⬜️⬜️⬜️⬜️⬜️⬜️⬜️    2️⃣⬜️🟫⬜️⬜️⬜️🟫⬜️
    1️⃣⬜️⬜️⬜️💎⬜️⬜️⬜️    1️⃣⬜️🟫⬜️💎⬜️⬜️⬜️
    2️⃣⬜️⬜️⬜️⬜️⬜️⬜️⬜️    2️⃣⬜️🟫⬜️⬜️⬜️🟫⬜️
    5️⃣⬜️⬜️⬜️⬜️⬜️⬜️⬜️    5️⃣⬜️🟫🟫🟫🟫🟫⬜️
    0️⃣⬜️⬜️⬜️⬜️⬜️⬜️⬜️    0️⃣⬜️⬜️⬜️⬜️⬜️⬜️⬜️


All halls and rooms are connected to each other.  
(Connections are only vertical and horizontal, not diagonal.)

There are no 2x2 open spaces outside of a treasure room.




### Motivation

The goal of this project is to create elegant examples of readable modern web code in a minimalist style.

We adhere to the following constraints:

- Source code is distributed in individual modules with no bundling or minifying. (Library paths are rewritten to avoid the need for import maps. Source maps are distributed with the original TSX code.)

- Files can be served from any static host, with no database or dynamic HTTP content. (Application state is mainly stored in hyperlinks which can be shared by users.)

- Total download size is small enough to be practical on extremely slow networks (currently about 20kB). (We detect emoji and unicode symbols available on the client to avoid the need for bundled graphics.)


### Notable Implementation Features

- All app-specific values in `index.html` and `manifest.json` are taken from `package.json`.

- Modules are preloaded in `main.js`, so the entire app loads in 3 round-trip times. It is possible to preload them directly in `index.html` for 2 round-trip times, but this increases file size as it requires listing each module twice to support all browsers. Rendering the complete list of modules into the HTML template could be a viable optimization.

- The `PuzzleGrid` component calculates its size dynamically, and sets that size with an inline `<style>` element targeting its own descendents.

- The `Puzzle` class uses mutable subclasses so that an IDE can detect that most editing methods are not available on the base class. Subclasses of `Puzzle` and `Brush` use a delegate pattern (overridden "should" and "did" methods) to control behavior of the superclass.

- The `Tile` class is a self-contained export. All subclasses and utility methods are static properties of the base class.


### Development

1. Install [Node.js](https://nodejs.org/en/)

2. Install the dependencies for this project:

```bash
npm install
```

3. Build the app and watch for source changes:

```bash
npm run watch
```

4. Run a local web server:

```bash
npm run serve
```
