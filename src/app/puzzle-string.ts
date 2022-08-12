import { default as runes } from 'runes';
import { Tile, Puzzle, TileTypes, SolvableTile } from './puzzle-model.js';

const { Floor, MarkedFloor, Wall, Treasure, Monster, BossMonster } = TileTypes;

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
                rowTiles.push(Tile.parse(specTile));
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
                rowStrings.push(tile.ASCII);
            }
            lines.push(rowStrings.join(''))
        }
        return lines.join('\n');
    }

    static toEmoji(puzzle: Puzzle): string {
        const lines: string[] = [puzzle.name];
        lines.push('⬜️' + puzzle.colTargets.map(PuzzleString.emojiNumber).join(''));
        let i = 0;
        for (const row of puzzle.tiles) {
            const rowStrings = [];
            rowStrings.push(PuzzleString.emojiNumber(puzzle.rowTargets[i++]));
            for (const tile of row) {
                rowStrings.push(tile.emoji);
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
                rowStrings.push(PuzzleString.tileURI(tile));
            }
            lines.push(rowStrings.join(''))
        }
        return lines.join('!');
    }

    static toStateURI(puzzle: Puzzle): string {
        return (puzzle.tiles.map((row)=>(
            row.map(PuzzleString.tileURI).join('')
        )).join('!'));
    }

    static tileURI(tile: Tile): string {
        if (tile instanceof SolvableTile) {
            return tile.ASCII;
        }
        else {
            return tile.emoji;
        }
    }

    static emojiNumber(n: number): string {
        const table = ['0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
        if (n < table.length) {
            return table[n];
        }
        else {
            return `${n},`;
        }
    }
}



/* --- query and hash --- */

export function parseQuery(query: string): {[key:string]: any} {
    query = query.replace(/^\?|\/$/g,'');
    const items = query.split('&');
    const params: any = {};
    items.forEach(function(item){
        const parts = item.split('=');
        const key = decodeURIComponent(parts[0]);
        let value: string | string[] | number = decodeURIComponent(parts[1]);
        if (value.match(/^\d+$/)) {
            value = parseInt(value);
        }
        else if (value.match(/,/)) {
            value = value.split(/,/);
        }
        params[key] = value;
    });
    return params;
}
