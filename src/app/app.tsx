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

const dailyPuzzles: string[] = [
`Example Puzzle 1
⬜️2️⃣5️⃣3️⃣3️⃣2️⃣3️⃣3️⃣2️⃣
1️⃣🟫⬜️⬜️⬜️⬜️⬜️⬜️⬜️
4️⃣⬜️⬜️🟥🟥🟥⬜️🟥⬜️
2️⃣⬜️🟥⬜️⬜️⬜️⬜️🟥⬜️
2️⃣⬜️🟥⬜️👑⬜️🟥🐀⬜️
3️⃣⬜️🟥⬜️⬜️⬜️🟥🟥⬜️
4️⃣⬜️🟥🟥🟥🟥🐍⬜️⬜️
2️⃣⬜️⬜️⬜️⬜️⬜️🟥⬜️🟫
5️⃣🟫🟫🟫🟫⬜️⬜️⬜️🟫
`,
`Example Puzzle 2
.25332332
1#.......
4..###.#.
2.#....#.
2.#.t.#m.
3.#...##.
4.####🐍..
2.....#.#
5####...#
`,
`Example Puzzle
.424121
3.....t
1......
2......
5......
1.....m
2m.....
`,
`Tenaxxus's Gullet
.44262347
7.....m..
3........
4.t......
1........
7........
1m.......
6........
3..m....m
`,
`The Lair of the Elemental King
.52125423
4.......m
1........
4..m.....
2........
6........
2........
3...t....
2........
`
];

export function App() {
    const puzzle = new Puzzle(dailyPuzzles[4]);
    window.puzzle = puzzle;
    return (
        <div id="app" className="app">
            <h1>Daily Dungeons and Diagrams</h1>
            <PuzzleGrid puzzle={puzzle} />
        </div>
    );
}
