import { Puzzle, EditablePuzzle, Tile, TileTypes, tileIndex } from "./puzzle.js";
import { appSettings } from "./settings.js";

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
 *   toggles the tile if it is already the target
 * 
 */
export type EventType = "leftClick" | "rightClick" | "touch" | "default";
export type TileType = (new () => Tile);

export interface EventTileMap {
    leftClick?: TileType[];
    rightClick?: TileType[];
    touch?: TileType[];
    default: TileType[];
}

export class Brush {
    tileOrder: EventTileMap = {
        default: [Wall, Floor]
    };
    activeTile: Tile | null = null;
    glyph: string | null = null;

    constructor(tileOrder?: TileType[]) {
        if (tileOrder) {
            this.tileOrder.default = tileOrder;
        }
    }

    getNextTile(prevTile:Tile, eventType:EventType): TileType {
        const order:TileType[] = this.tileOrder[eventType] || this.tileOrder.default;
        const index = order.indexOf(prevTile.constructor as TileType);
        const nextType = order[(index + 1) % order.length];
        return nextType;
    }

    shouldPaint(puzzle:Puzzle, index:tileIndex) {
        // subclasses should override this to delegate
        return true;
    }

    paintTile(puzzle:Puzzle, index:tileIndex) {
        if (this.activeTile && this.shouldPaint(puzzle, index)) {
            const result = puzzle.setTile(index, this.activeTile);
            if (result) {
                this.didPaint(puzzle, index);
            }
        }
    }

    didPaint(puzzle:Puzzle, index:tileIndex) {
        // subclasses should override this to run a proc
        undefined;
    }

    strokeStart(puzzle:Puzzle, index:tileIndex, eventType:EventType) {
        const prevTile = puzzle.getTile(index) as Tile;
        const nextType = this.getNextTile(prevTile, eventType);
        this.activeTile = new nextType();
        if (this.glyph && nextType !== Floor) {
            this.activeTile.setGlyph(this.glyph);
        }
        this.paintTile(puzzle, index);
    }

    strokeMove(puzzle:Puzzle, index:tileIndex) {
        this.paintTile(puzzle, index);
    }

    strokeEnd(puzzle:Puzzle) {
        this.activeTile = null;
    }
}

export class EraseBrush extends Brush {
    tileOrder = {default: [Floor]};
}
 
export class MonsterBrush extends Brush {
    tileOrder = {default: [Monster, Floor]};
    glyph = appSettings.getItem("default-monster-glyph") as string || "🦁";

    getNextTile(prevTile:Tile, eventType:EventType) {
        if (prevTile.toHTML() === this.glyph) {
            return Floor;
        }
        else {
            return Monster;
        }
    }
}

export class TreasureBrush extends Brush {
    tileOrder = {default: [Treasure, Floor]};
    glyph = "💎";
}

export class DesignBrush extends Brush {
    tileOrder = {default: [Wall, Floor]};
    monsterGlyph = appSettings.getItem("default-monster-glyph") as string || "🦁";

    autoMonster = true;
    autoTarget = true;

    didPaint(puzzle:EditablePuzzle, index:tileIndex) {
        if (this.autoMonster) {
            puzzle.updateMonsters(index, [1, 1], this.monsterGlyph);
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
    };

    shouldPaint(puzzle:Puzzle, index:tileIndex) {
        return (!puzzle.isSolved().solved);
    }

    strokeEnd(puzzle: Puzzle) {
        if (puzzle.isSolved().solved) {
            puzzle.unmarkFloors();
        }
        super.strokeEnd(puzzle);
    }
}
