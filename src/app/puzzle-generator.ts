import { Puzzle, EditablePuzzle, Tile, TileTypes, countInstances, tileCoords, tileSize } from "./puzzle.js";
const { Floor, MarkedFloor, Wall, Treasure, Monster, BossMonster, WalkableTile, RoomFloor, HallFloor } = TileTypes;

type fraction = number;

/**
 * @class RNG -
 * Wichmann–Hill pseudorandom number generator
 */
export class RNG {
    s1: number;
    s2: number;
    s3: number;

    constructor(seed:number) {
        if (seed < 1) {
            seed = seed + 30000 * (Math.floor(seed / -30000)+1)
        }
        seed = ((seed-1) % 30000) + 1;
        this.s1 = seed;
        this.s2 = seed;
        this.s3 = seed;
    }

    step() {
        this.s1 = (171 * this.s1) % 30269;
        this.s2 = (172 * this.s2) % 30307;
        this.s3 = (170 * this.s3) % 30323;
    }

    random():fraction {
        this.step();
        return ((this.s1/30269.0 + this.s2/30307.0 + this.s3/30323.0) % 1.0);
    }

    randInt(n:number):number {
        const i = Math.floor(this.random() * n);
        // console.log(`RNG: ${i}/${n}`);
        return i;
    }

    *[Symbol.iterator]() {
        while (true) {
            yield this.random();
        }
    }
}

export function getDayNumber(date?:Date) {
    date ||= new Date();
    const day0 = new Date(Date.UTC(2022,8,1));
    const dayOffset = (Number(date) - Number(day0)) / (24 * 60 * 60 * 1000);
    return Math.floor(dayOffset);
}

export class PuzzleGenerator {
    seed: number;
    rng: RNG;
    cosmeticRNG: RNG;
    puzzle: EditablePuzzle;

    constructor(seed?:number, [nRows, nCols]:tileSize=[8,8]) {
        if (typeof seed === "undefined") {
            seed = getDayNumber();
        }
        this.seed = seed;
        this.rng = new RNG(seed);
        this.cosmeticRNG = new RNG(seed);

        const name = `Daily Dungeon ${seed}`;
        const rowTargets = new Array(nRows);
        const colTargets = new Array(nCols);
        this.puzzle = new EditablePuzzle({name, rowTargets, colTargets, tiles:[]});
        this.initializeGrid();
    }

    initializeGrid() {
        const { puzzle } = this;
        const { nRows, nCols } = puzzle;
        puzzle.setAllTiles([], Wall);
    }

    placeRoom([row, col]:tileCoords) {
        const { puzzle, rng } = this;

        for (let r=row; r<row+3; r++) {
            for (let c=col; c<col+3; c++) {
                puzzle.setTile([r, c], new RoomFloor());
            }
        }
        puzzle.setTile([row+rng.randInt(3), col+rng.randInt(3)], new Treasure());
    }

    placeRandomRoom() {
        const { puzzle, rng } = this;

        const row = rng.randInt(puzzle.nRows-3);
        const col = rng.randInt(puzzle.nCols-3);
        const region = puzzle.getTilesInRect([row-1, col-1], [5, 5]);
        const nFloors = countInstances(WalkableTile, region);

        if (nFloors === 0) {
            this.placeRoom([row, col]);
            return 1;
        }
        else {
            return 0;
        }
    }

    makeMaze(nRows:number=8, nCols:number=8) {
        const { seed, rng, cosmeticRNG, puzzle } = this;

        /*
        maze generation algorithm:

        Prim's algorithm or depth-first search - can start anywhere
        Kruskal's algorithm - can handle arbitrary number of rooms
        Wilson's algorithm (Loop-erased random walk) - unbiased shape
        all loopless mazes would need to be extended to include loops
        */
        // rng.randInt(puzzle.nRows-3), rng.randInt(puzzle.nCols-3)

        const cursor: tileCoords = [rng.randInt(nRows), rng.randInt(nCols)]
        puzzle.setTile(cursor, new HallFloor());
    }

    finalizePuzzle() {
        const { puzzle } = this;

        puzzle.updateWallTargets();
        puzzle.updateMonsters([0, 0], [puzzle.nRows, puzzle.nCols]);
    }

    generate(): Puzzle {
        let nRooms = 0;
        const maxTries = 1 + this.rng.randInt(100);
        // console.log(`trying ${maxTries} times to place ${2} rooms`);
        for (let tries = 0; tries < maxTries; tries++) {
            nRooms += this.placeRandomRoom();
            if (nRooms >= 2) {
                break;
            }
        }
        this.makeMaze();
        this.finalizePuzzle();
        return this.puzzle;
    }
}

export function generatePuzzle(seed?:number, [nRows, nCols]:tileSize=[8,8]): Puzzle {
    const generator = new PuzzleGenerator(seed, [nRows, nCols]);
    return generator.generate();
}

