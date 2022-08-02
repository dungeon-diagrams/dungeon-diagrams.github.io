/*

A puzzle model consists of spec and state.
The spec is the target wall counts in each row/column, and the monster/treasure locations.
The state is the current grid of walls and floors.
A puzzle is solved when the state is valid and matches the spec.
A puzzle is partially solved when there are any walls and it is not fully solved.
We would like to encourage sharing unsolved (but solveable) puzzles.
We would like to discourage sharing spoilers.

Essential operations:
- parse a shareable string into a model (supporting emoji)
- serialize a model into a shareable string
- count the walls in each row/column
- check if the wall counts match a spec
- check if the layout is valid

*/

enum TileType {
    FLOOR = ".",
    WALL = "#",
    MONSTER = "m",
    TREASURE = "t"
}

export class Tile {
    type: TileType;

    constructor(spec: string) {
        this.type = spec as TileType;
    }
}

export interface PuzzleState {
    name: string;
    rows?: number[];
    cols?: number[];
    cells: Tile[][];
}


const spec = `
⬜️2️⃣5️⃣3️⃣3️⃣2️⃣3️⃣3️⃣2️⃣
1️⃣⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️
4️⃣⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️
2️⃣⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️
2️⃣⬜️⬜️⬜️👑⬜️⬜️🐀⬜️
3️⃣⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️
4️⃣⬜️⬜️⬜️⬜️⬜️🐍⬜️⬜️
2️⃣⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️
5️⃣⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️
`;

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

export function parsePuzzleSpec(spec: string) {
    const cells = [];
    const specRows = spec.trim().split("\n");
    let i = 0;
    for (const specRow of specRows) {
        i += 1;
        if (i == 1) {
            continue;
        }
        const rowCells = specRow.substring(1).split('').map((char)=>new Tile(char));
        cells.push(rowCells);
    }
    return {
        name: "Example Puzzle",
        cells: cells
    }
}
