import { h, Component, render } from "preact";
import { parsePuzzleSpec } from './puzzle-model.js';
import { PuzzleGrid } from './puzzle-view.js';


const spec2 = `
.25332332
1#.......
4..###.#.
2.#....#.
2.#.t.#m.
3.#...##.
4.####m..
2.....#.#
5####...#
`;

const examplePuzzle = new PuzzleGrid(parsePuzzleSpec(spec2));

export function App() {
    return (
        <div id="app" className="app">
            <h1>Daily Dungeons and Diagrams</h1>
            <PuzzleGrid {...parsePuzzleSpec(spec2)} />
        </div>
    );
}
