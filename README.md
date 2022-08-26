# Daily Dungeons and Diagrams

A single-page web application that serves daily shareable puzzles.

This project is intended as an example of readable modern web code in a minimalist style:

- Distributed code is in individual module files, with no minification. This is supported by [the majority of browsers in use since 2019](https://caniuse.com/es6-module-dynamic-import)
- Source maps are distributed with the original TSX code.
- We make use of emoji and unicode symbols, and simple CSS shapes.
- State is stored in strings that can be shared by users, with no app backend.
- The total download size is less than 20kB (excluding source maps).

### Development

1. Install [Node.js](https://nodejs.org/en/)

2. Install the [TypeScript](https://www.typescriptlang.org/) compiler and [Gulp](https://gulpjs.com/) build system:

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

### Notable Implementation Features

- The `Tile` class is a self-contained export. All subclasses and utility methods are static properties of the base class.

- The `Puzzle` class uses mutable subclasses so that an IDE can detect that most editing methods are not available on the base class.

- The `PuzzleGrid` component calculates its size dynamically, and sets that size with an inline `<style>` element targeting its own descendents.

- All app-specific values in `index.html` and `manifest.webmanifest` are taken from `package.json`.

- Modules are preloaded in `main.js`, so the entire app loads in 3 round-trip times. It is possible to preload them directly in `index.html` for 2 round-trip times, but this increases file size as it requires listing each module twice to support all browsers. Rendering the complete list of modules into the HTML template could be a viable optimization.
