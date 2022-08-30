import { Tile, TileTypes } from "./tile.js";
export { Tile, TileTypes } from "./tile.js";

const { Floor, MarkedFloor, Wall, Treasure, Monster, BossMonster, WalkableTile, FixedTile } = TileTypes;

/**
 * @class Puzzle
 * 
 * A puzzle model consists of spec and state.
 * The spec is the target wall counts in each row/column, and the monster/treasure locations.
 * The state is the current grid of walls and floors.
 * A puzzle is solved when the state is valid and matches the spec.
 * A puzzle is partially solved when there are any walls and it is not fully solved.
 * We would like to encourage sharing unsolved (but solveable) puzzles.
 * We would like to discourage sharing spoilers.
 */
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
        this.updateTiles(tiles);
        this.tiles ||= [];
    }

    updateTiles(newTiles: Tile[][]) {
        this.tiles = [];
        for (let row = 0; row < this.nRows; row++) {
            this.tiles.push([]);
            for (let col = 0; col < this.nCols; col++) {
                let newTile;
                if (newTiles[row]) {
                    newTile = newTiles[row][col];
                }
                this.tiles[row].push(newTile || new Floor());
            }
        }
    }

    didChange() {
        // this should be called once at the end of each 'set' method.
        // but not for each 'update' method.
        this.dispatchEvent(new Event("change"));
    }

    [Symbol.iterator](): Iterator<[number, number, Tile]> {
        return this.getTilesInRect(0, 0, this.nRows, this.nCols) as Iterator<[number, number, Tile]>;
    }

    *getTilesInRect(row:number, col:number, height:number, width:number): Generator<[number, number, Tile]> {
        for (let r = Math.max(0, row); r < Math.min(this.nRows, row+height); r++) {
            for (let c = Math.max(0, col); c < Math.min(this.nCols, col+width); c++) {
                yield [r, c, this.tiles[r][c]];
            }
        }
    }

    *getTilesAdjacentTo(row:number, col:number, height = 1, width = 1): Generator<[number, number, Tile]> {
        for (const r of [row-1, row+height]) {
            for (let c = col; c < col+width; c++) {
                if (this.isInBounds(r, c)) {
                    yield [r, c, this.tiles[r][c]];
                }
            }
        }
        for (const c of [col-1, col+width]) {
            for (let r = row; r < row+height; r++) {
                if (this.isInBounds(r, c)) {
                    yield [r, c, this.tiles[r][c]];
                }
            }
        }
    }

    *getConnectedTiles(row:number, col:number): Generator<[number, number, Tile]> {
        const visited = new Set();
        const toVisit = [[row, col, this.tiles[row][col]]];
        while (toVisit.length > 0) {
            const loc = toVisit.shift() as [number, number, Tile];
            const [r, c, t] = loc;
            const id = `${r},${c}`;
            if (visited.has(id)) {
                continue;
            }
            visited.add(id);
            yield loc;
            for (const nextLoc of this.getTilesAdjacentTo(r, c)) {
                if (nextLoc[2] instanceof WalkableTile) {
                    toVisit.push(nextLoc);
                }
            }
        }
    }

    isInBounds(row:number, col:number): boolean {
        return (row >= 0 && row < this.nRows && col >= 0 && col < this.nCols);
    }

    getTile(row:number, col:number): Tile | null {
        if (!this.isInBounds(row, col)) {
            return null;
        }
        return this.tiles[row][col];
    }

    canEditTile(row:number, col:number) {
        if (!this.isInBounds(row, col)) {
            return false;
        }
        // subclasses override this to add permissions
        return false;
    }

    setTile(row:number, col:number, newTile:Tile): boolean {
        if (!this.canEditTile(row, col)) {
            return false;
        }
        this.tiles[row][col] = newTile;
        this.didChange();
        return true;
    }

    isSolved(): {solved:boolean, reason:string} {
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
        if (!this.isConnected()) {
            return {solved: false, reason: "Hallways are not connected."};
        }
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
            // - no 2x2 blocks of FLOOR tiles unless a TREASURE is adjacent (including diagonals)
            if (this.isWideHall(row, col)) {
                if (!this.isTreasureRoom(row, col)) {
                    return {solved: false, reason: `Hallway too wide: (${row}, ${col})`};
                }
            }
            // - each TREASURE is in a treasure room (3x3 block of 8 FLOOR and 1 TREASURE, adjacent to exactly 1 FLOOR and 0 MONSTER)
            if (tile instanceof Treasure && !this.isTreasureRoom(row, col)) {
                return {solved: false, reason: `Treasure not in proper room: (${row}, ${col})`};
            }
        }
        return {solved: true, reason: "Valid dungeon layout."};
    }

    isWideHall(row:number, col:number): boolean {
        const walkableCount = countInstances(WalkableTile, this.getTilesInRect(row, col, 2, 2));
        const treasureCount = countInstances(Treasure, this.getTilesAdjacentTo(row-1, col-1, 2, 2));
        return (walkableCount === 4 && treasureCount === 0);
    }

    isTreasureRoom(row:number, col:number) {
        for (const [r, c, tile] of this.getTilesInRect(row-2, col-2, 3, 3)) {
            const room = this.getTilesInRect(r, c, 3, 3);
            const roomFloors = countInstances(Floor, room);
            // const treasures = countInstances(Treasure, room);
            const boundary = this.getTilesAdjacentTo(r, c, 3, 3);
            const boundaryFloors = countInstances(Floor, boundary);
            if (roomFloors === 8 && boundaryFloors === 1) {
                return true;
            }
        }
        return false;
    }

    isDeadEnd(row:number, col:number): boolean {
        if (this.tiles[row][col] instanceof Wall) {
            return false;
        }
        const walkableCount = countInstances(WalkableTile, this.getTilesAdjacentTo(row, col));
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

    isConnected(): boolean {
        const halls = [...this].filter(([row, col, tile])=>(
            tile instanceof WalkableTile
        ));
        if (halls.length == 0) {
            return true;
        }
        const firstHall = halls[0];
        const connectedHalls = [...this.getConnectedTiles(firstHall[0], firstHall[1])];
        return (connectedHalls.length === halls.length);
    }

    unsolve(): Puzzle {
        // TODO: don't mutate original array
        for (const [row, col, tile] of this) {
            if (!(tile instanceof FixedTile)) {
                this.tiles[row][col] = new Floor();
            }
        }
        this.didChange();
        return this;
    }

    unmarkFloors(): Puzzle {
        // TODO: don't mutate original array
        for (const [row, col, tile] of this) {
            if (tile instanceof MarkedFloor) {
                this.tiles[row][col] = new Floor();
            }
        }
        this.didChange();
        return this;
    }

    solvableCopy(): SolvablePuzzle {
        const other = new SolvablePuzzle({...this});
        return other;
    }

    editableCopy(): EditablePuzzle {
        const other = new EditablePuzzle({...this});
        return other;
    }
}

export class SolvablePuzzle extends Puzzle {
    canEditTile(row: number, col: number) {
        if (!this.isInBounds(row, col)) {
            return false;
        }
        const oldTile = this.tiles[row][col];
        if (oldTile instanceof FixedTile) {
            return false;
        }
        return true;
    }
}

export class EditablePuzzle extends Puzzle {
    canEditTile(row: number, col: number) {
        if (!this.isInBounds(row, col)) {
            return false;
        }
        return true;
    }

    updateWallTargets() {
        const {rowCounts, colCounts} = this.countWalls();
        this.rowTargets = rowCounts;
        this.colTargets = colCounts;
    }

    setSize(nRows: number, nCols: number, autoTarget=false) {
        this.nRows = nRows;
        this.nCols = nCols;
        const oldTiles = this.tiles;
        this.updateTiles(oldTiles);
        while (this.rowTargets.length < nRows) {
            this.rowTargets.push(0);
        }
        while (this.colTargets.length < nCols) {
            this.colTargets.push(0);
        }
        this.rowTargets.length = nRows;
        this.colTargets.length = nCols;
        if (autoTarget) {
            this.updateWallTargets();
        }
        this.didChange();
    }

    setRowTargets(rowTargets: number[]) {
        this.rowTargets = rowTargets;
        if (this.rowTargets.length != this.nRows) {
            this.setSize(this.rowTargets.length, this.nCols);
        }
    }

    setColTargets(colTargets: number[]) {
        this.colTargets = colTargets;
        if (this.colTargets.length != this.nCols) {
            this.setSize(this.nRows, this.colTargets.length);
        }
    }

    updateMonsters(row:number, col:number, monsterGlyph?: string) {
        this.getTilesInRect;
        for (const [r, c, tile] of this.getTilesAdjacentTo(row, col)) {
            const deadEnd = this.isDeadEnd(r, c);
            if (deadEnd && !(tile instanceof Monster)) {
                this.tiles[r][c] = new Monster();
                if (monsterGlyph) {
                    this.tiles[r][c].setGlyph(monsterGlyph);
                }
            }
            else if ((tile instanceof Monster) && !deadEnd) {
                this.tiles[r][c] = new Floor();
            }
        }
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

function countInstances(ofType: typeof Tile, a: Iterable<[number, number, Tile]>) {
    let count = 0;
    for (const [row, col, tile] of a) {
        count += Number(tile instanceof ofType);
    }
    return count;
}
