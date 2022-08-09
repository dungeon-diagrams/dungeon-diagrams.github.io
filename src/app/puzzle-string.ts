import { default as runes } from 'runes';
import { Tile, Puzzle, TileTypes } from './puzzle-model.js';

const { FLOOR, WALL, TREASURE, MONSTER } = TileTypes;

/* --- tile --- */

export class TileString {
    static parse(displayTile: string): Tile {
        for (const tileType of [FLOOR, WALL, TREASURE, MONSTER]) {
            if (displayTile.match(tileType.pattern)) {
                return new Tile(tileType, {display: displayTile})
            }
        }
        return new Tile(MONSTER, {display: displayTile});
    }

    static toASCII(tile: Tile): string {
        if (tile.type === FLOOR && tile.reserved) {
            return 'x';
        }
        if (!tile.display.match(/\p{ASCII}/u)) {
            return tile.type.ASCII;
        }
        return tile.display;
    }
    
    static toEmoji(tile: Tile): string {
        if (tile.type === FLOOR && tile.reserved) {
            return '🔲';
        }
        if (!tile.display.match(/\p{Emoji}/u)) {
            return tile.type.emoji;
        }
        else {
            return tile.display;
        }
    }

    static toHTML(tile: Tile): string {
        if (tile.type === FLOOR && tile.reserved) {
            return '×';//⨯';
        }
        if (!tile.display.match(/\p{Emoji}/u)) {
            return tile.type.emoji;
        }
        else {
            return tile.display;
        }
    }

    static toURI(tile: Tile): string {
        if (tile.type === FLOOR || tile.type === WALL) {
            return TileString.toASCII(tile);
        }
        else {
            return TileString.toEmoji(tile);
        }
}
}

/* --- puzzle --- */

export class PuzzleString {
    static parse(spec: string): Puzzle {
        const name = PuzzleString.parseName(spec);
        const rowTargets = PuzzleString.parseRowCounts(spec);
        const colTargets = PuzzleString.parseColCounts(spec);
        const tiles = PuzzleString.parseTiles(spec);
        return new Puzzle({name, rowTargets, colTargets, tiles});
    }

    static parseName(spec: string): string {
        return spec.trim().split(/[\n,!]/)[0];
    }

    static parseRowCounts(spec: string): number[] {
        const counts = [];
        const specRows = spec.trim().split(/[\n,!]/).slice(2);
        for (const specRow of specRows) {
            counts.push(parseInt(specRow));
        }
        return counts;
    }

    static parseColCounts(spec: string): number[] {
        const counts = [];
        const specRow = runes(spec.trim().split(/[\n,!]/)[1]).slice(1);
        for (const specCol of specRow) {
            counts.push(parseInt(specCol));
        }
        return counts;
    }

    static parseTiles(spec: string) {
        const tiles: Tile[][] = [];
        const specRows = spec.trim().split(/[\n,!]/).slice(2);
        for (const specRow of specRows) {
            const rowTiles: Tile[] = [];
            for (const specTile of runes(specRow).slice(1)) {
                rowTiles.push(TileString.parse(specTile));
            }
            tiles.push(rowTiles);
        }
        return tiles;
    }

    static toASCII(puzzle: Puzzle): string {
        const lines: string[] = [puzzle.name];
        lines.push('.' + puzzle.colTargets.join(''));
        let i = 0;
        for (const row of puzzle.tiles) {
            const rowStrings = [];
            rowStrings.push(puzzle.rowTargets[i++].toFixed(0));
            for (const tile of row) {
                rowStrings.push(TileString.toASCII(tile));
            }
            lines.push(rowStrings.join(''))
        }
        return lines.join('\n');
    }

    static toEmoji(puzzle: Puzzle): string {
        const lines: string[] = [puzzle.name];
        lines.push('⬜️' + puzzle.colTargets.map(emojiNumber).join(''));
        let i = 0;
        for (const row of puzzle.tiles) {
            const rowStrings = [];
            rowStrings.push(emojiNumber(puzzle.rowTargets[i++]));
            for (const tile of row) {
                rowStrings.push(TileString.toEmoji(tile));
            }
            lines.push(rowStrings.join(''))
        }
        return lines.join('\n');
    }

    static toURI(puzzle: Puzzle): string {
        const lines: string[] = [puzzle.name];
        lines.push('.' + puzzle.colTargets.join(''));
        let i = 0;
        for (const row of puzzle.tiles) {
            const rowStrings = [];
            rowStrings.push(puzzle.rowTargets[i++].toFixed(0));
            for (const tile of row) {
                rowStrings.push(TileString.toURI(tile));
            }
            lines.push(rowStrings.join(''))
        }
        return lines.join('!');
    }

    static toStateURI(puzzle: Puzzle): string {
        return (puzzle.tiles.map((row)=>(
            row.map(TileString.toURI).join('')
        )).join('!'));
    }
}

function emojiNumber(n: number): string {
    const table = ['0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
    if (n < table.length) {
        return table[n];
    }
    else {
        return `${n},`;
    }
}
