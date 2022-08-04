import { h } from "preact";
import { Puzzle } from './puzzle-model.js';
import { PuzzleGrid } from './puzzle-view.js';

export { render } from "preact";

declare global {
    // debugging
    interface Window {
        runes: object;
        puzzle: any;
        preact: object;
        test: any;
    }
}

const spec = `
Example Puzzle
⬜️2️⃣5️⃣3️⃣3️⃣2️⃣3️⃣3️⃣2️⃣
1️⃣🟫⬜️⬜️⬜️⬜️⬜️⬜️⬜️
4️⃣⬜️⬜️🟥🟥🟥⬜️🟥⬜️
2️⃣⬜️🟥⬜️⬜️⬜️⬜️🟥⬜️
2️⃣⬜️🟥⬜️👑⬜️🟥🐀⬜️
3️⃣⬜️🟥⬜️⬜️⬜️🟥🟥⬜️
4️⃣⬜️🟥🟥🟥🟥🐍⬜️⬜️
2️⃣⬜️⬜️⬜️⬜️⬜️🟥⬜️🟫
5️⃣🟫🟫🟫🟫⬜️⬜️⬜️🟫
`;

const spec2 = `
Example Puzzle 2
.25332332
1#.......
4..###.#.
2.#....#.
2.#.t.#m.
3.#...##.
4.####🐍..
2.....#.#
5####...#
`;

export function App() {
    const puzzle = new Puzzle(spec);
    window.puzzle = puzzle;
    return (
        <div id="app" className="app">
            <h1>Daily Dungeons and Diagrams</h1>
            <PuzzleGrid puzzle={puzzle} />
        </div>
    );
}
