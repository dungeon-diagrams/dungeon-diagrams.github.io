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

Integration:
- would like to support copying for auto-solve and undo/redo
- would like to trigger view updates when properties change

Puzzle
    specs {name, rowCounts, colCounts, monsters, treasures}
    state {Tile[][]}
    .isSolved(): boolean
    .setTile(x, y, Tile | TileType)
        -> only allow overwriting monsters/treasures if the puzzle is marked as editable
        -> replaces state with an updated copy
        -> triggers a callback on observers
    .addObserver(callback)
*/

interface TileType {
    name: string;
    ASCII: string;
    emoji: string;
    pattern: RegExp;
    opposite?: TileType;
}

// floor: '.' or any black/white square or any whitespace
const FLOOR: TileType = {
    name: "floor",
    ASCII: '.',
    emoji: '⬜️',
    pattern: /\.|\p{White_Space}|[🔳🔲⬛️⬜️▪️▫️◾️◽️◼️◻️]/iu,
};

// wall: '#' or any other color square
const WALL: TileType = {
    name: "wall",
    ASCII: '#',
    emoji: '🟫',
    pattern: /[#🟥🟧🟨🟩🟦🟪🟫]/iu,
    opposite: FLOOR
};

// treasure: 't' or 💎 (any emoji Activity or Objects)
const TREASURE: TileType = {
    name: "treasure",
    ASCII: 'T',
    emoji: '💎',
    pattern: /[t🏆🥇🥈🥉🏅🎖🔮🎁📦💎👑]/iu
};

// monster: any emoji Animals & nature, anything else
const MONSTER: TileType = {
    name: "monster",
    ASCII: 'm',
    emoji: '🦁',
    pattern: /[m🐶🐱🐭🐹🐰🦊🐻🐼🐻‍❄️🐨🐯🦁🐮🐷🐽🐸🐵🙈🙉🙊🐒🐔🐧🐦🐤🐣🐥🦆🦅🦉🦇🐺🐗🐴🦄🐝🪱🐛🦋🐌🐞🐜🪰🪲🪳🦟🦗🕷🕸🦂🐢🐍🦎🦖🦕🐙🦑🦐🦞🦀🐡🐠🐟🐬🐳🐋🦈🦭🐊🐅🐆🦓🦍🦧🦣🐘🦛🦏🐪🐫🦒🦘🦬🐃🐂🐄🐎🐖🐏🐑🦙🐐🦌🐕🐩🦮🐕‍🦺🐈🐈‍⬛🐓🦃🦤🦚🦜🦢🦩🕊🐇🦝🦨🦡🦫🦦🦥🐁🐀🐿🦔🐉🐲🦠🧊]/iu
};

function emojiNumber(n: number): string {
    const table = ['0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
    if (n < table.length) {
        return table[n];
    }
    else {
        return `${n},`;
    }
}

export class Tile {
    display: string;
    type: TileType;
    x?: number;
    y?: number;

    constructor(displayTile: string) {
        this.display = displayTile;
        this.type = this.parse(displayTile);
    }

    parse(displayTile: string): TileType {
        for (const tileType of [FLOOR, WALL, TREASURE, MONSTER]) {
            if (displayTile.match(tileType.pattern)) {
                return tileType;
            }
        }
        return MONSTER;
    }

    toName(): string {
        return this.type.name;
    }

    toASCII(): string {
        return this.type.ASCII;
    }

    toEmoji(): string {
        if (!this.display.match(/\p{Emoji}/u)) {
            return this.type.emoji;
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

export class Observable {
    observers: Set<Function>;

    constructor() {
        this.observers = new Set();
    }

    addObserver(callback: Function) {
        this.observers.add(callback);
    }

    removeObserver(callback: Function) {
        this.observers.delete(callback);
    }

    didChange() {
        for (const observer of this.observers) {
            observer(this);
        }
    }
}

export class Puzzle extends Observable {
    name: string;
    rowCounts: number[];
    colCounts: number[];
    tiles: Tile[][];
    editable: boolean;

    constructor(spec: string) {
        super();
        this.name = spec.trim().split("\n")[0];
        this.tiles = this.parseTiles(spec);
        this.rowCounts = this.parseRowCounts(spec);
        this.colCounts = this.parseColCounts(spec);
        this.editable = false;
    }

    isSolved(): boolean {
        return false;
    }

    setTile(x: number, y: number, newType?: TileType, newDisplay?: string): boolean {
        if (x < 0 || x >= this.colCounts.length || y < 0 || y >= this.rowCounts.length) {
            return false;
        }
        const oldTile = this.tiles[y][x];
        if (!this.editable) {
            if (oldTile.type === MONSTER || oldTile.type === TREASURE) {
                return false;
            }
        }
        newType ||= WALL;
        this.tiles[y][x].type = newType;
        this.tiles[y][x].display = newDisplay || newType.emoji;
        this.didChange();
        return true;
    }

    parseRowCounts(spec: string): number[] {
        const counts = [];
        const specRows = spec.trim().split("\n").slice(2);
        for (const specRow of specRows) {
            counts.push(parseInt(specRow));
        }
        return counts;
    }

    parseColCounts(spec: string): number[] {
        const counts = [];
        const specRow = runes(spec.trim().split("\n")[1]).slice(1);
        for (const specCol of specRow) {
            counts.push(parseInt(specCol));
        }
        return counts;
    }

    parseTiles(spec: string) {
        const tiles: Tile[][] = [];
        const specRows = spec.trim().split("\n").slice(2);
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
        const lines: string[] = [this.name];
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
        const lines: string[] = [this.name];
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
        // TODO: don't mutate original
        for (const row of this.tiles) {
            for (const tile of row) {
                if (tile.type === WALL) {
                    tile.type = FLOOR;
                    tile.display = '.';
                }
            }
        }
        return this;
    }
}
