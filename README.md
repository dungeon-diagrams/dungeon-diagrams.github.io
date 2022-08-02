# Daily Dungeons and Diagrams

A single-page web application that serves daily shareable puzzles.

This project is intended as an example of readable modern web code in a minimalist style:

- Distributed code is in individual module files, with no minification. This is supported by [the majority of browsers in use since 2019](https://caniuse.com/es6-module-dynamic-import)
- Source maps are distributed with the original TSX code.
- We make use of emoji and unicode symbols, and simple CSS shapes.
- State is stored in strings that can be shared by users, with no app backend.
- The total download size is less than 10kB (excluding source maps).

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
