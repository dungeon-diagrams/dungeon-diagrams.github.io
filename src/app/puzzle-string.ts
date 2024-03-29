import { default as runes } from "runes";
import { Puzzle, Tile } from "./puzzle.js";

export function parse(spec:string): Puzzle {
    const name = parseName(spec);
    const rowTargets = parseRowCounts(spec);
    const colTargets = parseColCounts(spec);
    const tiles = parseTiles(spec);
    return new Puzzle({name, rowTargets, colTargets, tiles});
}

export function parseName(spec:string): string {
    const nameLine = spec.trim().split(/[\n,!]/)[0];
	return nameLine.replace(/[\s_+]+/g, " ").replace(/%21/g, "!").replace(/%2C/gi, ",");
}

export function parseRowCounts(spec:string): number[] {
    const counts = [];
    const specRows = spec.trim().split(/[\n,!]/).slice(2);
    for (const specRow of specRows) {
        counts.push(parseInt(specRow, 10)); // TODO: support other number glyphs
    }
    return counts;
}

export function parseColCounts(spec:string): number[] {
    const counts = [];
    const specCols = runes(spec.trim().split(/[\n,!]/)[1].trim()).slice(1);
    for (const specCol of specCols) {
        counts.push(parseInt(specCol, 10)); // TODO: support other number glyphs
    }
    return counts;
}

export function parseTiles(spec:string) {
    const tiles: Tile[][] = [];
    const specRows = spec.trim().split(/[\n,!]/).slice(2);
    for (const specRow of specRows) {
        const rowTiles: Tile[] = [];
        for (const specTile of runes(specRow.trim()).slice(1)) {
            rowTiles.push(Tile.parse(specTile));
        }
        tiles.push(rowTiles);
    }
    return tiles;
}

export function toASCII(puzzle:Puzzle): string {
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

export function toEmoji(puzzle:Puzzle): string {
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

export function toURI(puzzle:Puzzle, includeState=false): string {
    let uri = `?puzzle=${ encodeURIComponent(toUnsolvedURI(puzzle)) }`;
    if (includeState) {
        uri += `#?state=${ encodeURIComponent(toStateURI(puzzle)) }`;
    }
    return uri;
}

export function toUnsolvedURI(puzzle:Puzzle): string {
    return toPuzzleURI(puzzle, false);
}

export function toPuzzleURI(puzzle:Puzzle, includeState=true): string {
	const name = puzzle.name.replace(/\s/g, "_").replace(/!/g, "%21").replace(/,/g, "%2C");
    const lines: string[] = [name];
    lines.push(`.${  puzzle.colTargets.join("")}`);
    let i = 0;
    for (const row of puzzle.tiles) {
        const rowStrings = [];
        rowStrings.push(puzzle.rowTargets[i++].toFixed(0));
        for (const tile of row) {
            if (includeState) {
                rowStrings.push(tile.toURI());
            }
            else {
                rowStrings.push(tile.toUnsolvedURI());
            }
        }
        lines.push(rowStrings.join("").replace(/\.*$/, ""));
    }
    return lines.join("!");
}

export function toStateURI(puzzle:Puzzle): string {
    return (puzzle.tiles.map((row)=>(
        row.map((t)=>t.toURI()).join("").replace(/\.*$/, "")
    )).join("!"));
}

export function emojiNumber(n:number): string {
    const table = runes("0️⃣1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣9️⃣🔟");
    if (n < table.length) {
        return table[n];
    }
    else {
        return `${n},`;
    }
}
