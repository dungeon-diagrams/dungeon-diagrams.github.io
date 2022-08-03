import { default as runes } from 'runes';

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

export enum TileType {
    FLOOR = 'floor',
    WALL = 'wall',
    MONSTER = 'monster',
    TREASURE = 'treasure',
}

// export const TileType = {
//     "FLOOR":    {name: "floor",    ASCII: '.', "emoji": '⬜️'},
//     "WALL":     {name: "wall",     ASCII: '#', "emoji": '🟫'},
//     "MONSTER":  {name: "monster",  ASCII: 'm', "emoji": '🏆'},
//     "TREASURE": {name: "treasure", ASCII: 'T', "emoji": '🐊'},
// };

export class Tile {
    display: string;
    type: TileType;

    constructor(displayTile: string) {
        this.display = displayTile;
        this.type = this.parse(displayTile);
    }

    parse(displayTile: string): TileType {
        // wall: '#' or any other color square
        if (displayTile.match(/#|[🟥🟧🟨🟩🟦🟪🟫]/iu)) {
            return TileType.WALL;
        }
        // floor: '.' or any black/white square or any whitespace
        if (displayTile.match(/\.|\p{White_Space}|[🔳🔲⬛️⬜️▪️▫️◾️◽️◼️◻️]/iu)) {
            return TileType.FLOOR;
        }
        // treasure: 't' or 🏆 (any emoji Activity or Objects)
        if (displayTile.match(/t|🏆/iu)) {
            return TileType.TREASURE;
        }
        // monster: any emoji Animals & nature, anything else
        return TileType.MONSTER;
    }

    toASCII(): string {
        switch(this.type) {
            case TileType.FLOOR:
                return '.';
            case TileType.WALL:
                return '#';
            case TileType.TREASURE:
                return 'T';
            case TileType.MONSTER:
                return 'm';
        }
    }

    toEmoji(): string {
        if (this.display.match(/\p{ASCII}/u)) {
            switch(this.type) {
                case TileType.FLOOR:
                    return '⬜️';
                case TileType.WALL:
                    return '🟫';
                case TileType.TREASURE:
                    return '🏆';
                case TileType.MONSTER:
                    return '🐊';
            }
        }
        else {
            return this.display;
        }
    }
}

export interface PuzzleState {
    name: string;
    rowCounts: number[];
    colCounts: number[];
    tiles: Tile[][];
}

export class Puzzle {
    name: string;
    tiles: Tile[][];
    rowCounts: number[];
    colCounts: number[];

    constructor(spec: string) {
        this.name = "Example Puzzle";
        this.tiles = this.parseTiles(spec);
        this.rowCounts = this.parseRowCounts(spec);
        this.colCounts = this.parseColCounts(spec);
    }

    parseRowCounts(spec: string): number[] {
        const counts = [];
        const specRows = spec.trim().split("\n").slice(1);
        for (const specRow of specRows) {
            counts.push(parseInt(specRow));
        }
        return counts;
    }

    parseColCounts(spec: string): number[] {
        const counts = [];
        const specRow = runes(spec.trim().split("\n")[0]).slice(1);
        for (const specCol of specRow) {
            counts.push(parseInt(specCol));
        }
        return counts;
    }

    parseTiles(spec: string) {
        const tiles: Tile[][] = [];
        const specRows = spec.trim().split("\n").slice(1);
        for (const specRow of specRows) {
            const rowTiles: Tile[] = [];
            for (const specTile of runes(specRow).slice(1)) {
                rowTiles.push(new Tile(specTile));
            }
            tiles.push(rowTiles);
        }
        return tiles;
    }

    toASCII(): string {
        const lines: string[] = [''];
        lines.push('.' + this.colCounts.join(''));
        let i = 0;
        for (const row of this.tiles) {
            const rowStrings = [];
            rowStrings.push(this.rowCounts[i++].toFixed(0));
            for (const tile of row) {
                rowStrings.push(tile.toASCII());
            }
            lines.push(rowStrings.join(''))
        }
        return lines.join('\n');
    }

    toEmoji(): string {
        const lines: string[] = [''];
        lines.push('⬜️' + this.colCounts.map(emojiNumber).join(''));
        let i = 0;
        for (const row of this.tiles) {
            const rowStrings = [];
            rowStrings.push(emojiNumber(this.rowCounts[i++]));
            for (const tile of row) {
                rowStrings.push(tile.toEmoji());
            }
            lines.push(rowStrings.join(''))
        }
        return lines.join('\n');
    }

    unsolve(): Puzzle {
        for (const row of this.tiles) {
            for (const tile of row) {
                if (tile.type == TileType.WALL) {
                    tile.type = TileType.FLOOR;
                    tile.display = '.';
                }
            }
        }
        return this;
    }
}

function emojiNumber(n: number): string {
    const table = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    return table[n];
}
