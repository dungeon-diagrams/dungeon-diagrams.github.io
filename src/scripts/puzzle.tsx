import { h, Component } from "preact";

enum TileType {
    FLOOR = ".",
    WALL = "#",
    MONSTER = "m",
    TREASURE = "t"
}

class Tile {
    type: TileType;

    constructor(spec: string) {
        this.type = spec as TileType;
    }
}

interface PuzzleState {
    name: string;
    rows?: number[];
    cols?: number[];
    cells: Tile[][];
}

export class PuzzleGrid extends Component<PuzzleState> {
    render(props: PuzzleState) {
        const rowEls = props.cells.map((row, y)=>(
            <tr>
                {row.map((tile, x)=>(
                    <td><PuzzleCell x={x} y={y} tile={tile}/></td>
                ))}
            </tr>
        ));
        return (
            <table>
                <tbody>
                    {rowEls}
                </tbody>
            </table>
        )
    }
}

interface CellProps {
    x: number;
    y: number;
    tile: Tile;
}

export class PuzzleCell extends Component<CellProps> {
    render(props: CellProps) {
        return (
            <div>{props.tile.type}</div>
        )
    }
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

export const examplePuzzle = new PuzzleGrid(parsePuzzleSpec(spec2));
