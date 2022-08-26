import { default as runes } from "runes";
import { Puzzle, Tile, TileTypes } from "./puzzle-model.js";

const { FixedTile } = TileTypes;

export function parse(spec: string): Puzzle {
    const name = parseName(spec);
    const rowTargets = parseRowCounts(spec);
    const colTargets = parseColCounts(spec);
    const tiles = parseTiles(spec);
    return new Puzzle({name, rowTargets, colTargets, tiles});
}

export function parseName(spec: string): string {
    return spec.trim().split(/[\n,!]/)[0];
}

export function parseRowCounts(spec: string): number[] {
    const counts = [];
    const specRows = spec.trim().split(/[\n,!]/).slice(2);
    for (const specRow of specRows) {
        counts.push(parseInt(specRow, 10)); // TODO: support other number glyphs
    }
    return counts;
}

export function parseColCounts(spec: string): number[] {
    const counts = [];
    const specRow = runes(spec.trim().split(/[\n,!]/)[1]).slice(1);
    for (const specCol of specRow) {
        counts.push(parseInt(specCol, 10)); // TODO: support other number glyphs
    }
    return counts;
}

export function parseTiles(spec: string) {
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

export function toASCII(puzzle: Puzzle): string {
    const lines: string[] = [puzzle.name];
    lines.push(`.${  puzzle.colTargets.join("")}`);
    let i = 0;
    for (const row of puzzle.tiles) {
        const rowStrings = [];
        rowStrings.push(puzzle.rowTargets[i++].toFixed(0));
        for (const tile of row) {
            rowStrings.push(tile.ASCII);
        }
        lines.push(rowStrings.join(""));
    }
    return lines.join("\n");
}

export function toEmoji(puzzle: Puzzle): string {
    const lines: string[] = [puzzle.name];
    lines.push(`⬜️${  puzzle.colTargets.map(emojiNumber).join("")}`);
    let i = 0;
    for (const row of puzzle.tiles) {
        const rowStrings = [];
        rowStrings.push(emojiNumber(puzzle.rowTargets[i++]));
        for (const tile of row) {
            rowStrings.push(tile.emoji);
        }
        lines.push(rowStrings.join(""));
    }
    return lines.join("\n");
}

export function toURI(puzzle: Puzzle, includeState=false): string {
    let uri = `?puzzle=${  encodeURIComponent(toUnsolvedURI(puzzle))}`;
    if (includeState) {
        uri += `#?state=${  encodeURIComponent(toStateURI(puzzle))}`;
    }
    return uri;
}

export function toUnsolvedURI(puzzle: Puzzle): string {
    return toPuzzleURI(puzzle, false);
}

export function toPuzzleURI(puzzle: Puzzle, includeState = true): string {
    const lines: string[] = [puzzle.name];
    lines.push(`.${  puzzle.colTargets.join("")}`);
    let i = 0;
    for (const row of puzzle.tiles) {
        const rowStrings = [];
        rowStrings.push(puzzle.rowTargets[i++].toFixed(0));
        for (const tile of row) {
            if (includeState) {
                rowStrings.push(tileURI(tile));
            }
            else {
                rowStrings.push(unsolvedTileURI(tile));
            }
        }
        lines.push(rowStrings.join("").replace(/\.*$/, ""));
    }
    return lines.join("!");
}

export function toStateURI(puzzle: Puzzle): string {
    return (puzzle.tiles.map((row)=>(
        row.map(tileURI).join("").replace(/\.*$/, "")
    )).join("!"));
}

export function unsolvedTileURI(tile: Tile): string {
    if (!(tile instanceof FixedTile)) {
        return ".";
    }
    else {
        return tile.emoji;
    }
}

export function tileURI(tile: Tile): string {
    if (!(tile instanceof FixedTile)) {
        return tile.ASCII;
    }
    else {
        return tile.emoji;
    }
}

export function emojiNumber(n: number): string {
    const table = ["0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];
    if (n < table.length) {
        return table[n];
    }
    else {
        return `${n},`;
    }
}
