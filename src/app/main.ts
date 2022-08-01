import { h, Component, render } from "preact";
import * as preact from 'preact';
import { default as runes } from 'runes';

import { sayHello } from "./widget.js";
import { parsePuzzleSpec } from './puzzle.js';
import { PuzzleGrid } from './puzzle-view.js';

declare global {
    interface Window {
        runes: object;
        test: any;
        preact: object;
    }
}

window.runes = runes;
window.preact = preact;

const spec2 = `
.25332332
1#.......
4..###.#.
2.#....#.
2.#.c.#m.
3.#...##.
4.####m..
2.....#.#
5####...#
`;

const examplePuzzle = new PuzzleGrid(parsePuzzleSpec(spec2));
window.test = examplePuzzle;


const el = document.getElementById("app");
if (el) {
    el.innerHTML = '';
    render(sayHello("foo"), el);
    runes(spec2);
    // render(examplePuzzle, el);
}
