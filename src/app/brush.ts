import { TileTypes, Tile, Puzzle, EditablePuzzle } from "./puzzle-model.js";

const { Wall, Floor, MarkedFloor, Monster, Treasure } = TileTypes;

/**
 * @class Brush
 * a configurable object that mediates the editing interface.
 * a PuzzleGrid component should have a single Brush active at any time.
 * a brush should usually toggle a specific tile type
 * eg: Brush(Monster(lion))
 * 
 * EraseBrush:
 *   always sets to floor
 * 
 * SolvingBrush:
 *   cycles through tiles based on input event type
 *   disables editing after puzzle is solved
 * 
 * DesignBrush:
 *   toggles walls
 *   option to auto-place monsters
 *   option to auto-update wall targets
 * 
 * MonsterBrush and TreasureBrush:
 *   creates a new tile with a custom glyph
 *   toggles the tile if it is already floor
 * 
 */
 export type EventType = "leftClick" | "rightClick" | "touch" | "default";

 export interface EventTileMap {
     leftClick?: Function[];
     rightClick?: Function[];
     touch?: Function[];
     default: Function[];
 }
 

export class Brush {
    tileOrder: EventTileMap = {
        default: [Wall, Floor]
    };
    activeTile: Tile | null = null;
    glyph: string | null = null;

    constructor(tileOrder?: Function[]) {
        if (tileOrder) {
            this.tileOrder.default = tileOrder;
        }
    }

    getNextTile(prevTile: Tile, eventType: EventType) {
        const order: Function[] = this.tileOrder[eventType] || this.tileOrder.default;
        const index = order.indexOf(prevTile.constructor);
        const nextType = order[(index + 1) % order.length] as (new () => Tile);
        return new nextType();
    }

    paintTile(puzzle: Puzzle, row: number, col: number) {
        if (this.activeTile) {
            const result = puzzle.setTile(row, col, this.activeTile);
            if (result) {
                this.didPaint(puzzle, row, col);
            }
        }
    }

    didPaint(puzzle: Puzzle, row: number, col: number) {
        // subclasses should override this to run a proc
        undefined;
    }

    strokeStart(puzzle: Puzzle, row: number, col: number, eventType: EventType) {
        const prevTile = puzzle.getTile(row, col) as Tile;
        this.activeTile = this.getNextTile(prevTile, eventType);
        if (this.glyph) {
            this.activeTile.setGlyph(this.glyph);
        }
        this.paintTile(puzzle, row, col);
    }

    strokeMove(puzzle: Puzzle, row: number, col: number) {
        this.paintTile(puzzle, row, col);
    }

    strokeEnd(puzzle: Puzzle) {
        this.activeTile = null;
    }
}

 export class EraseBrush extends Brush {
     tileOrder = {default: [Floor]};
 }
 
 export class MonsterBrush extends Brush {
     tileOrder = {default: [Monster, Floor]};
     glyph = 'm';
 }
 
 export class TreasureBrush extends Brush {
     tileOrder = {default: [Treasure, Floor]};
     glyph = 'T';
 }
 
 export class DesignBrush extends Brush {
     tileOrder = {default: [Wall, Floor]};
 
     autoMonster = false;
     autoTarget = false;
 
     didPaint(puzzle:EditablePuzzle, row:number, col:number) {
         if (this.autoMonster) {
             puzzle.updateMonsters();    
         }
         if (this.autoTarget) {
             puzzle.updateWallTargets();
         }
     }
 }
 
 export class SolveBrush extends Brush {
     tileOrder = {
         leftClick: [Wall, Floor],
         rightClick: [MarkedFloor, Floor],
         default: [Wall, MarkedFloor, Floor]
     }
 
     strokeEnd(puzzle: Puzzle) {
         this.activeTile = null;
         if (puzzle.isSolved().solved) {
             puzzle.unmarkFloors();
         }
 
     }
 }
 