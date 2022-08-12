/*

A puzzle model consists of spec and state.
The spec is the target wall counts in each row/column, and the monster/treasure locations.
The state is the current grid of walls and floors.
A puzzle is solved when the state is valid and matches the spec.
A puzzle is partially solved when there are any walls and it is not fully solved.
We would like to encourage sharing unsolved (but solveable) puzzles.
We would like to discourage sharing spoilers.

*/

export abstract class Tile {
    name: string = 'tile';
    ASCII: string = '_';   // should be encodable as a URI with no escape
    emoji: string = '🌫';  // should be square
    HTML: string = '';
    static pattern: RegExp = /.|[\?_-]/;

    constructor(char?: string) {
        if (char) {
            if (char.match(/\p{ASCII}/)) {
                this.ASCII = char;
            }
            else {
                this.emoji = char;
            }
        }
        this.HTML ||= this.emoji;
    }

    nextTile(editing?: boolean): Tile {
        let order: Function[] = [Floor, Wall, MarkedFloor];
        if (editing) {
            order = [Floor, Wall, Monster, BossMonster, Treasure];
        }
        const index = order.indexOf(this.constructor);
        const nextType = order[(index+1) % order.length] as (new (display?:string) => Tile);
        return new nextType();
    }

    static parse(char: string): Tile {
        for (const tileType of [Floor, Wall, Treasure, BossMonster, MarkedFloor, Monster]) {
            if (char.match(tileType.pattern)) {
                return new tileType(char);
            }
        }
        return new Monster(char);
    }
}

export abstract class SolvableTile extends Tile { }

export class Floor extends SolvableTile {
    name = 'floor';
    ASCII = '.';
    emoji = '⬜️';
    static pattern = /\p{White_Space}|[\.·🔳🔲⬛️⬜️▪️▫️◾️◽️◼️◻️]/iu;
}

export class MarkedFloor extends Floor {
    name = 'floor-marked';
    ASCII = 'x';
    emoji = '🔳';
    HTML = '×';
    static pattern = /[x✖️×✖️x╳⨯⨉❌🚫💠]/i;
}

export class Wall extends SolvableTile {
    name = 'wall';
    ASCII = '*';
    emoji = '🟫';
    static pattern = /[*#🟥🟧🟨🟩🟦🟪🟫]/iu;
}

export class Treasure extends Tile {
    name = 'treasure';
    ASCII = 'T';
    emoji = '💎';
    static pattern = /[t🏆🥇🥈🥉🏅🎖🔮🎁📦💎👑]/iu;
}

export class Monster extends Tile {
    name = 'monster';
    ASCII = 'm';
    emoji = '🦁';
    static pattern = /[m☺︎☹☻☃︎♜♝♞♟♖♗♘♙🐶🐱🐭🐹🐰🦊🐻🐼🐻‍❄️🐨🐯🦁🐮🐷🐽🐸🐵🙈🙉🙊🐒🐔🐧🐦🐤🐣🐥🦆🦅🦉🦇🐺🐗🐴🦄🐝🪱🐛🦋🐌🐞🐜🪰🪲🪳🦟🦗🕷🕸🦂🐢🐍🦎🐙🦑🦐🦞🦀🐡🐠🐟🐬🐳🐋🦈🦭🐅🐆🦓🦍🦧🦣🐘🦛🦏🐪🐫🦒🦘🦬🐃🐂🐄🐎🐖🐏🐑🦙🐐🦌🐕🐩🦮🐕‍🦺🐈🐈‍⬛🐓🦃🦤🦚🦜🦢🦩🕊🐇🦝🦨🦡🦫🦦🦥🐁🐀🐿🦔☃️⛄️🦠]/u;
}

export class BossMonster extends Monster {
    name = 'monster-boss';
    ASCII = 'M';
    emoji = '🐲';
    static pattern = /[M♚♛♔♕🦖🦕🐊🐉🐲🧊]/u;
}

export const TileTypes = { Floor, MarkedFloor, Wall, Treasure, Monster, BossMonster };

export class Puzzle extends EventTarget {
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
        this.tiles = tiles; // TODO: make copy
        for (let row = 0; row < this.nRows; row++) {
            this.tiles[row] ||= [];
            while (this.tiles[row].length < this.nCols) {
                this.tiles[row].push(new Floor());
            }
        }
    }

    didChange() {
        this.dispatchEvent(new Event('change'));
    }

    [Symbol.iterator](): Iterator<[number, number, Tile]> {
        return this.getTilesInRect(0, 0, this.nRows, this.nCols);
    }

    *getTilesInRect(row: number, col: number, height: number, width: number): Iterator<[number, number, Tile]> {
        for (let r = Math.max(0, row); r < Math.min(this.nRows, row+height); r++) {
            for (let c = Math.max(0, col); c < Math.min(this.nCols, col+width); c++) {
                yield [r, c, this.tiles[r][c]];
            }
        }
    }

    *getTilesAdjacentTo(row: number, col: number, height: number = 1, width: number = 1) {
        for (const r of [row-1, row+height]) {
            for (let c = col; c < col+width; c++) {
                if (this.isInBounds(r, c)) {
                    yield this.tiles[r][c];
                }
            }
        }
        for (const c of [col-1, col+width]) {
            for (let r = row; r < row+height; r++) {
                if (this.isInBounds(r, c)) {
                    yield this.tiles[r][c];
                }
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
            if ((tile instanceof Monster) && !deadEnd) {
                return {solved: false, reason: `Some monster is not in a dead end: (${row}, ${col}).`};
            }
            // - each dead end contains a MONSTER
            if (!(tile instanceof Monster) && deadEnd) {
                return {solved: false, reason: `Some dead end has no monster: (${row}, ${col}).`};
            }
        }
        // - each TREASURE is in a treasure room (3x3 block of 8 FLOOR and 1 TREASURE, adjacent to exactly 1 FLOOR and 0 MONSTER)
        // - no 2x2 blocks of FLOOR tiles unless a TREASURE is adjacent (including diagonals)
        return {solved: true, reason: 'Valid dungeon layout.'};
    }

    isDeadEnd(row: number, col: number): boolean {
        if (this.tiles[row][col] instanceof Wall) {
            return false;
        }
        let walkableCount = 0;
        for (const tile of this.getTilesAdjacentTo(row, col)) {
            walkableCount += Number(!(tile instanceof Wall));
        }
        return (walkableCount === 1);
    }

    countWalls() {
        const rowCounts: number[] = [];
        const colCounts: number[] = [];
        for (const [row, col, tile] of this) {
            rowCounts[row] ||= 0;
            colCounts[col] ||= 0;
            if (tile instanceof Wall) {
                rowCounts[row]++;
                colCounts[col]++;
            }
        }
        return {rowCounts, colCounts};
    }

    unsolve(): Puzzle {
        // TODO: don't mutate original
        for (const [row, col, tile] of this) {
            if (tile instanceof SolvableTile) {
                this.tiles[row][col] = new Floor();
            }
        }
        this.didChange();
        return this;
    }

    unmarkFloors(): Puzzle {
        // TODO: don't mutate original
        for (const [row, col, tile] of this) {
            if (tile instanceof MarkedFloor) {
                this.tiles[row][col] = new Floor();
            }
        }
        this.didChange();
        return this;
    }

    solvableCopy(): SolvablePuzzle {
        const other = new SolvablePuzzle({...this})
        return other;
    }

    editableCopy(): EditablePuzzle {
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
        if (!(oldTile instanceof SolvableTile)) {
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

    setTile(row: number, col: number, newTile: Tile): boolean {
        if (!this.canEditTile(row, col)) {
            return false;
        }
        this.tiles[row][col] = newTile;
        const {rowCounts, colCounts} = this.countWalls();
        this.rowTargets = rowCounts;
        this.colTargets = colCounts;
        this.didChange();
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
