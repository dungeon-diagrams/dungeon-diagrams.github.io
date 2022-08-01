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
2.#.c.#m.
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
