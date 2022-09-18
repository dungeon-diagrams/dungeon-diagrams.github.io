import { h, Fragment } from "preact";
import { EditablePuzzle, Puzzle, SolvablePuzzle } from "./puzzle-model.js";
import { PuzzleSolver } from "./puzzle-view.js";
import { PuzzleEditor } from "./puzzle-editor.js";
import * as PuzzleString from "./puzzle-string.js";
import { parseQuery } from "./html-utils.js";
import { SettingsButton } from "./settings.js";
import { PuzzleGenerator, generatePuzzle, getDayNumber } from "./puzzle-generator.js";

/*
 idea for a router: use 404.html to serve the main app.
 then we can have urls like:
 /puzzle/1/Tenaxxus-Gullet
 /puzzle/1#?state=..xx+.t.m,..m.x|
 /puzzle/?r=424121&c=312512&t=0,5&m=4,5,5,0#?state=.x+.t.|
*/

/* eslint indent: 0 */
const examplePuzzles: string[] = [
`Example Dungeon
.424121
3.....t
1......
2......
5......
1.....M
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
3.🐂.🎁....
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
2.......👹
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
`Test Puzzle 1
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
`Test Puzzle 2
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
`Test Puzzle 3
⬜️0️⃣7️⃣1️⃣3️⃣6️⃣2️⃣2️⃣2️⃣
1️⃣🪱⬜️🐊⬜️⬜️⬜️⬜️⬜️
3️⃣⬜️⬜️⬜️⬜️⬜️⬜️💎⬜️
2️⃣⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️
6️⃣⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️
4️⃣⬜️⬜️⬜️🦖⬜️⬜️⬜️⬜️
3️⃣⬜️⬜️⬜️⬜️⬜️💎⬜️⬜️
1️⃣⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️
3️⃣🐢⬜️🦏⬜️⬜️⬜️⬜️⬜️
`
];

/*
We can link to an individual puzzle:
href="?puzzle_id=4"
or to a partial solution:
href="?puzzle=(shareable string)"
*/

export function App(query?: string) {
    query ||= document.location.search;
    const params = parseQuery(query);
    const puzzleString = params.puzzle as string;
    const dayNum = params.day as number;
    let puzzle;
    if (puzzleString) {
        puzzle = PuzzleString.parse(puzzleString);
    }
    else if (dayNum || dayNum === 0) {
		const generator = new PuzzleGenerator(dayNum);
		Object.assign(globalThis, {generator});
        puzzle = generator.generate();
		// puzzle.unsolve();
    }
    
	let page;
	if (params.mode === "edit") {
        puzzle ||= new Puzzle({name:"Untitled Dungeon", colTargets:[0,0,0,0,0,0,0,0], rowTargets:[0,0,0,0,0,0,0,0], tiles: []});
		if (!(puzzle instanceof EditablePuzzle)) {
			puzzle = puzzle.editableCopy();
		}
		page = <PuzzleEditor puzzle={puzzle as EditablePuzzle} />;
	}
    else if (puzzle) {
		if (!(puzzle instanceof SolvablePuzzle)) {
			puzzle = puzzle.solvableCopy();
		}
        puzzle.unsolve();
		page = <PuzzleSolver puzzle={puzzle} />;
    }
    else {
        const navLinks = [];
        for (const puzzleString of examplePuzzles) {
            const puzzle = PuzzleString.parse(puzzleString);
            puzzle.unsolve();
            navLinks.push(<li className="puzzle-list">
                <a href={PuzzleString.toURI(puzzle)}>{puzzle.name}</a>
                <pre className="puzzle-preview">{PuzzleString.toEmoji(puzzle)}</pre>
            </li>);
        }
		const dayLinks = [];
		for (let i=1; i<getDayNumber(); i++) {
			const puzzle = generatePuzzle(i);
			puzzle.unsolve();
            dayLinks.push(<li className="puzzle-list">
                <a href={`?day=${i}`}>Daily Dungeon {i}</a>
                <pre className="puzzle-preview">{PuzzleString.toEmoji(puzzle)}</pre>
            </li>);
		}
		page = (<>
			<ul>
				{navLinks}
			</ul>
			<ul>
				{dayLinks}
			</ul>
			<ul>
				<li><a href="?mode=edit">Create New Dungeon</a></li>
			</ul>
		</>);
    }

	Object.assign(globalThis, {puzzle});
	return (
		<div id="app" className="app">
			<SettingsButton />
			<h1><a href=".">Daily Dungeons and Diagrams</a></h1>
			{page}
		</div>
	)
}
