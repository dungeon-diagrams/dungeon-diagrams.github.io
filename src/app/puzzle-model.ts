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

export interface TileType {
    name: string;
    ASCII: string;
    emoji: string;
    pattern: RegExp;
}

// floor: '.' or any black/white square or any whitespace
const FLOOR: TileType = {
    name: "floor",
    ASCII: '.',
    emoji: '⬜️',
    pattern: /\p{White_Space}|[\.x✖️×✖️x╳⨯⨉·🔳🔲⬛️⬜️▪️▫️◾️◽️◼️◻️💠_-]/iu,
};

// wall: '#' or any other color square
const WALL: TileType = {
    name: "wall",
    ASCII: '*',
    emoji: '🟫',
    pattern: /[*#🟥🟧🟨🟩🟦🟪🟫]/iu
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

export const TileTypes = {
    FLOOR, WALL, TREASURE, MONSTER
};

export class Tile {
    display: string;
    type: TileType;
    reserved: boolean;

    constructor(tileType: TileType, {display, reserved}: {display?: string, reserved?: boolean} = {}) {
        this.type = tileType;
        this.display = display || this.type.ASCII;
        this.reserved = reserved || false;
    }

    nextTile(): Tile {
        let newType;
        let newDisplay;
        if (this.type === WALL) {
            return new Tile(FLOOR, {reserved: true});
        }
        else if (this.type === FLOOR && this.reserved) {
            return new Tile(FLOOR);
        }
        else {
            return new Tile(WALL);
        }
    }
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
    __proto__?: object;
    name: string;
    nRows: number;
    nCols: number;
    rowTargets: number[];
    colTargets: number[];
    tiles: Tile[][];

    constructor({name, rowTargets, colTargets, tiles}: {name: string, rowTargets: number[], colTargets: number[], tiles: Tile[][]}) {
        super();
        this.name = name;
        this.rowTargets = rowTargets;
        this.nRows = this.rowTargets.length;
        this.colTargets = colTargets;
        this.nCols = this.colTargets.length;
        this.tiles = tiles;
        for (let row = 0; row < this.nCols; row++) {
            this.tiles[row] ||= [];
            const rowTiles: Tile[] = [];
            while (rowTiles.length < this.nRows) {
                rowTiles.push(new Tile(FLOOR));
            }
        }
    }

    *[Symbol.iterator](): Iterator<[number, number, Tile]> {
        for (let row = 0; row < this.nRows; row++) {
            for (let col = 0; col < this.nCols; col++) {
                yield [row, col, this.tiles[row][col]];
            }
        }
    }

    isInBounds(row: number, col: number): boolean {
        return (row >= 0 && row < this.nRows && col >= 0 && col < this.nCols);
    }

    getTile(row: number, col: number): Tile | null {
        if (!this.isInBounds(row, col)) {
            return null;
        }
        return this.tiles[row][col];
    }

    canEditTile(row: number, col: number) {
        if (!this.isInBounds(row, col)) {
            return false;
        }
        // subclasses override this to add permissions
        return false;
    }

    setTile(row: number, col: number, newTile: Tile): boolean {
        if (!this.canEditTile(row, col)) {
            return false;
        }
        this.tiles[row][col] = newTile;
        this.didChange();
        return true;
    }

    isSolved(): {solved: boolean, reason: string} {
        // a puzzle is solved when:
        // - all row/column wall counts are equal to their targets
        const {rowCounts, colCounts} = this.countWalls();
        if (!arrayEqual(rowCounts, this.rowTargets)) {
            return {solved: false, reason: "Row wall counts do not match targets."};
        }
        if (!arrayEqual(colCounts, this.colTargets)) {
            return {solved: false, reason: "Column wall counts do not match targets."};
        }
        // - all non-WALL tiles are connected
        for (const [row, col, tile] of this) {
            // - each MONSTER is in a dead end (adjacent to exactly 1 FLOOR)
            const deadEnd = this.isDeadEnd(row, col);
            if ((tile.type === MONSTER) && !deadEnd) {
                return {solved: false, reason: `Some monster is not in a dead end: (${row}, ${col}).`};
            }
            // - each dead end contains a MONSTER
            if ((tile.type !== MONSTER) && deadEnd) {
                return {solved: false, reason: `Some dead end has no monster: (${row}, ${col}).`};
            }
        }
        // - each TREASURE is in a treasure room (3x3 block of 8 FLOOR and 1 TREASURE, adjacent to exactly 1 FLOOR and 0 MONSTER)
        // - no 2x2 blocks of FLOOR tiles unless a TREASURE is adjacent (including diagonals)
        return {solved: true, reason: 'Valid dungeon layout.'};
    }

    isDeadEnd(row: number, col: number): boolean {
        if (this.tiles[row][col].type === WALL) {
            return false;
        }
        let walkableCount = 0;
        for (const tile of this.getAdjacentTiles(row, col)) {
            walkableCount += Number(tile.type !== WALL);
        }
        return (walkableCount === 1);
    }

    getAdjacentTiles(row: number, col: number, height: number = 1, width: number = 1, diagonal: boolean = false): Tile[] {
        const neighbors: Tile[] = [];
        const corner = (diagonal ? 1 : 0);
        for (const r of [row-1, row+height]) {
            for (let c = col - corner; c < col+width+corner; c++) {
                if (this.isInBounds(r, c)) {
                    neighbors.push(this.tiles[r][c]);
                }
            }
        }
        for (const c of [col-1, col+width]) {
            for (let r = row; r < row+height; r++) {
                if (this.isInBounds(r, c)) {
                    neighbors.push(this.tiles[r][c]);
                }
            }
        }
        return neighbors;
    }

    countWalls() {
        const rowCounts: number[] = [];
        const colCounts: number[] = [];
        for (const [row, col, tile] of this) {
            rowCounts[row] ||= 0;
            colCounts[col] ||= 0;
            if (tile.type === WALL) {
                rowCounts[row]++;
                colCounts[col]++;
            }
        }
        return {rowCounts, colCounts};
    }

    unsolve(): Puzzle {
        // TODO: don't mutate original
        for (const [row, col, tile] of this) {
            if (tile.type === WALL || tile.type === FLOOR) {
                tile.type = FLOOR;
                tile.display = '.';
            }
        }
        this.didChange();
        return this;
    }

    unmarkFloors(): Puzzle {
        // TODO: don't mutate original
        for (const [row, col, tile] of this) {
            if (tile.type === FLOOR && tile.reserved) {
                tile.reserved = false;
                tile.display = '.';
            }
        }
        this.didChange();
        return this;
    }

    solvableCopy(): SolvablePuzzle {
         // TODO: actually copy tiles
        const other = new SolvablePuzzle({...this})
        return other;
    }

    editableCopy(): EditablePuzzle {
         // TODO: actually copy tiles
         const other = new EditablePuzzle({...this})
         return other;
     }
}

class SolvablePuzzle extends Puzzle {
    canEditTile(row: number, col: number) {
        if (!this.isInBounds(row, col)) {
            return false;
        }
        const oldTile = this.tiles[row][col];
        if (oldTile.type === MONSTER || oldTile.type === TREASURE) {
            return false;
        }
        return true;
    }
}

class EditablePuzzle extends Puzzle {
    canEditTile(row: number, col: number) {
        if (!this.isInBounds(row, col)) {
            return false;
        }
        return true;
    }
}

function arrayEqual<T>(a1: Array<T>, a2: Array<T>): boolean {
    if (a1.length !== a2.length) {
        return false;
    }
    for (const i in a1) {
        if (a1[i] !== a2[i]) {
            return false;
        }
    }
    return true;
}
