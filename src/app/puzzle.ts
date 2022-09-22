import { Tile, TileTypes, TileClassType } from "./tile.js";
export { Tile, TileTypes } from "./tile.js";

const { Floor, MarkedFloor, Wall, Treasure, Monster, WalkableTile, SolvableTile } = TileTypes;

export type tileCoords = [number, number];
export type tileSize = [number, number];

function coord([row, col]:tileCoords) {
    return `(${row}, ${col})`;
}

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
    tiles: ReadonlyArray<ReadonlyArray<Tile>>;
    hasChanged = false;

    constructor({name, rowTargets, colTargets, tiles}: {name: string, rowTargets: number[], colTargets: number[], tiles: ReadonlyArray<ReadonlyArray<Tile>>}) {
        super();
        this.name = name;
        this.rowTargets = rowTargets;
        this.nRows = this.rowTargets.length;
        this.colTargets = colTargets;
        this.nCols = this.colTargets.length;
        this.setAllTiles(tiles);
        this.tiles ||= [];
        this.hasChanged = false;
    }

    setAllTiles(newTiles:ReadonlyArray<ReadonlyArray<Tile>>, defaultTile:TileClassType=Floor) {
        const tiles:Array<Array<Tile>> = [];
        for (let row = 0; row < this.nRows; row++) {
            tiles.push([]);
            for (let col = 0; col < this.nCols; col++) {
                let newTile;
                if (newTiles[row]) {
                    newTile = newTiles[row][col];
                }
                tiles[row].push(newTile || new defaultTile());
            }
        }
        this.tiles = tiles;
        this.didChange();
    }

    didChange() {
        this.hasChanged = true;
        setTimeout(this.dispatchChange, 1);
    }

    dispatchChange = () => {
        if (this.hasChanged) {
            this.hasChanged = false;
            this.dispatchEvent(new Event("change"));
        }
    }

    [Symbol.iterator](): Iterator<[tileCoords, Tile]> {
        return this.getTilesInRect([0, 0], [this.nRows, this.nCols]) as Iterator<[tileCoords, Tile]>;
    }

    *getTilesInRect([row, col]:tileCoords, [height, width]:tileSize): Generator<[tileCoords, Tile]> {
        for (let r = Math.max(0, row); r < Math.min(this.nRows, row+height); r++) {
            for (let c = Math.max(0, col); c < Math.min(this.nCols, col+width); c++) {
                yield [[r, c], this.tiles[r][c]];
            }
        }
    }

    *getTilesAdjacentTo([row, col]:tileCoords, [height, width]:tileSize=[1,1]): Generator<[tileCoords, Tile]> {
        for (const r of [row-1, row+height]) {
            for (let c = col; c < col+width; c++) {
                if (this.isInBounds([r, c])) {
                    yield [[r, c], this.tiles[r][c]];
                }
            }
        }
        for (const c of [col-1, col+width]) {
            for (let r = row; r < row+height; r++) {
                if (this.isInBounds([r, c])) {
                    yield [[r, c], this.tiles[r][c]];
                }
            }
        }
    }

    *getConnectedTiles(index:tileCoords): Generator<[tileCoords, Tile]> {
        const visited = new Set();
        const toVisit = [[index, this.getTile(index)]];
        while (toVisit.length > 0) {
            const loc = toVisit.shift() as [tileCoords, Tile];
            const [i, t] = loc;
            const id = coord(i);
            if (visited.has(id)) {
                continue;
            }
            visited.add(id);
            yield loc;
            for (const nextLoc of this.getTilesAdjacentTo(i)) {
                if (nextLoc[1] instanceof WalkableTile) {
                    toVisit.push(nextLoc);
                }
            }
        }
    }

    isInBounds([row, col]:tileCoords): boolean {
        return (row >= 0 && row < this.nRows && col >= 0 && col < this.nCols);
    }

    getTile(index:tileCoords): Tile | null {
        if (!this.isInBounds(index)) {
            return null;
        }
        const [row, col] = index;
        return this.tiles[row][col];
    }

    canEditTile(index:tileCoords): boolean {
        // subclasses override this to add permissions
        return false;
    }

    setTile(index:tileCoords, newTile:Tile): boolean {
        if (!this.isInBounds(index)) {
            return false;
        }
        if (!this.canEditTile(index)) {
            return false;
        }
        const [row, col] = index;
        (this.tiles as Array<Array<Tile>>)[row][col] = newTile;
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
        for (const [index, tile] of this) {
            // - each MONSTER is in a dead end (adjacent to exactly 1 FLOOR)
            const deadEnd = this.isDeadEnd(index);
            if ((tile instanceof Monster) && !deadEnd) {
                return {solved: false, reason: `Some monster is not in a dead end: ${coord(index)}.`};
            }
            // - each dead end contains a MONSTER
            if (!(tile instanceof Monster) && deadEnd) {
                return {solved: false, reason: `Some dead end has no monster: ${coord(index)}.`};
            }
            // - no 2x2 blocks of FLOOR tiles unless a TREASURE is adjacent (including diagonals)
            if (this.isWideHall(index)) {
                if (!this.isTreasureRoom(index)) {
                    return {solved: false, reason: `Hallway too wide: ${coord(index)}`};
                }
            }
            // - each TREASURE is in a treasure room (3x3 block of 8 FLOOR and 1 TREASURE, adjacent to exactly 1 FLOOR and 0 MONSTER)
            if (tile instanceof Treasure && !this.isTreasureRoom(index)) {
                return {solved: false, reason: `Treasure not in proper room: ${coord(index)}`};
            }
        }
        return {solved: true, reason: "Valid dungeon layout."};
    }

    isWideHall([row, col]:tileCoords): boolean {
        const walkableCount = countInstances(WalkableTile, this.getTilesInRect([row, col], [2, 2]));
        const treasureCount = countInstances(Treasure, this.getTilesAdjacentTo([row-1, col-1], [2, 2]));
        return (walkableCount === 4 && treasureCount === 0);
    }

    isTreasureRoom([row, col]:tileCoords) {
        for (const [index, tile] of this.getTilesInRect([row-2, col-2], [3, 3])) {
            const room = this.getTilesInRect(index, [3, 3]);
            const roomFloors = countInstances(Floor, room);
            // const treasures = countInstances(Treasure, room);
            const boundary = this.getTilesAdjacentTo(index, [3, 3]);
            const boundaryFloors = countInstances(Floor, boundary);
            if (roomFloors === 8 && boundaryFloors === 1) {
                return true;
            }
        }
        return false;
    }

    isDeadEnd(index:tileCoords): boolean {
        if (this.getTile(index) instanceof Wall) {
            return false;
        }
        const walkableCount = countInstances(WalkableTile, this.getTilesAdjacentTo(index));
        return (walkableCount === 1);
    }

    countWalls() {
        const rowCounts: number[] = [];
        const colCounts: number[] = [];
        for (const [[row, col], tile] of this) {
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
        const halls = [...this].filter(([index, tile])=>(
            tile instanceof WalkableTile
        ));
        if (halls.length == 0) {
            return true;
        }
        const [firstIndex, tile] = halls[0];
        const connectedHalls = [...this.getConnectedTiles(firstIndex)];
        return (connectedHalls.length === halls.length);
    }

    unsolve() {
        for (const [index, tile] of this) {
            if (tile instanceof SolvableTile) {
                this.setTile(index, new Floor());
            }
        }
    }

    unmarkFloors() {
        for (const [index, tile] of this) {
            if (tile instanceof MarkedFloor) {
                this.setTile(index, new Floor());
            }
        }
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
    canEditTile(index:tileCoords) {
        const oldTile = this.getTile(index);
        if (!oldTile || !(oldTile instanceof SolvableTile)) {
            return false;
        }
        return true;
    }
}

export class EditablePuzzle extends Puzzle {
    canEditTile(index:tileCoords) {
        return true;
    }

    updateWallTargets() {
        const {rowCounts, colCounts} = this.countWalls();
        this.rowTargets = rowCounts;
        this.colTargets = colCounts;
        this.didChange();
    }

    setSize([nRows, nCols]:tileSize, autoTarget=false) {
        this.nRows = nRows;
        this.nCols = nCols;
        const oldTiles = this.tiles;
        this.setAllTiles(oldTiles);
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

    setRowTargets(rowTargets:number[]) {
        this.rowTargets = rowTargets;
        if (this.rowTargets.length != this.nRows) {
            this.setSize([this.rowTargets.length, this.nCols]);
        }
        this.didChange();
    }

    setColTargets(colTargets:number[]) {
        this.colTargets = colTargets;
        if (this.colTargets.length != this.nCols) {
            this.setSize([this.nRows, this.colTargets.length]);
        }
        this.didChange();
    }

    updateMonsters(index:tileCoords, size:tileSize=[1,1], monsterGlyph?:string) {
        for (const list of [this.getTilesInRect(index, size), this.getTilesAdjacentTo(index, size)]) {
            for (const [i, tile] of list) {
                const deadEnd = this.isDeadEnd(i);
                if (deadEnd && !(tile instanceof Monster)) {
                    const newTile = new Monster(monsterGlyph);
                    this.setTile(i, newTile);
                }
                else if ((tile instanceof Monster) && !deadEnd) {
                    this.setTile(i, new Floor());
                }
            }
        }
    }
}

function arrayEqual<T>(a1:Array<T>, a2:Array<T>): boolean {
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

export function countInstances(ofType:typeof Tile, a:Iterable<[tileCoords, Tile]>) {
    let count = 0;
    for (const [index, tile] of a) {
        count += Number(tile instanceof ofType);
    }
    return count;
}
