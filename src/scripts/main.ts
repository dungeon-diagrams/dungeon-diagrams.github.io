import { h, Component, render } from "preact";
import { sayHello } from "./widget.js";
// import { runes } from 'runes';
import { PuzzleGrid, parsePuzzleSpec } from './puzzle.js';

declare global {
    interface Window {
        runes: object;
        test: any;
    }
}

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
    // runes(spec2);
    // render(examplePuzzle, el);
}
