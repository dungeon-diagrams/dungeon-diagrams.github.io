import { h } from "preact";
import { Puzzle } from './puzzle-model.js';
import { PuzzleGrid } from './puzzle-view.js';

export { render } from "preact";

// debugging
declare global {
    interface Window {
        runes: object;
        puzzle: any;
        preact: object;
        test: any;
    }
}

function parseQuery(query: string) {
    query = query.replace(/^\?|\/$/g,'');
    const items = query.split('&');
    const params: any = {};
    items.forEach(function(item){
        const parts = item.split('=');
        const key = decodeURIComponent(parts[0]);
        let value: string | string[] | number = decodeURIComponent(parts[1]);
        if (value.match(/^\d+$/)) {
            value = parseInt(value);
        }
        else if (value.match(/,/)) {
            value = value.split(/,/);
        }
        params[key] = value;
    });
    return params;
}

// TODO: put these in a navigation menu as links

const dailyPuzzles: string[] = [
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
4.🏆......
1........
7........
1m.......
6........
3..m....m
`,
`The Twin Cities of the Dead
.13153435
5........
2..t.t...
2........
3........
6🧟.......
0........
6........
1....🧟.🧟.
`,
`The Gardens of Hell
.14363144
6😈......😈
0........
4........
1.......😈
5😈.......
3........
3....🏆...
4😈.......
`,
`The House Penumbral
.04073432
6m.m.....
2.......t
3........
1........
5........
1........
4........
1......m.
`,
`The Maze of the Minotaur
.72613261
0m.......
7........
3.👹.🎁....
3........
3........
5........
2........
5........
`,
`The Halls of the Golemancer
.53246415
6.....🤖..
3.......🤖
3..t..🤖..
3.......🤖
5.....🤖..
3.......🤖
4........
3........
`,
`The Tomb of the Broken God
.13326241
1.t..m...
4........
1........
6........
2.......m
2........
5........
1.....m..
`,
`The Hive of Great Sorrow
.36054063
6..🐛..🐛..
2🐛......🐛
4........
3....🐛...
2........
4........
2🐛......🐛
4........
`,
`The Lair of the Elemental King
.52125423
4.......m
1........
4..🤴.....
2........
6........
2........
3...👑....
2........
`,
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
`
];

/*
We can link to an individual puzzle:
href="?puzzle_id=4"
or to a partial solution:
href="?puzzle=(shareable string)"
*/

export function App() {
    const params = parseQuery(document.location.search);
    const puzzleString = params.puzzle as string;
    const puzzleID = params.puzzle_id as number;
    let puzzle;
    if (puzzleString) {
        puzzle = new Puzzle(puzzleString);
    }
    else if (puzzleID || puzzleID === 0) {
        puzzle = new Puzzle(dailyPuzzles[puzzleID]);
    }
    else {
        puzzle = new Puzzle(dailyPuzzles[0]);
    }
    window.puzzle = puzzle;
    return (
        <div id="app" className="app">
            <h1>Daily Dungeons and Diagrams</h1>
            <PuzzleGrid puzzle={puzzle} />
        </div>
    );
}
