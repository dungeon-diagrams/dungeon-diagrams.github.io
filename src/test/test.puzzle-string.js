import { Puzzle } from "../app/puzzle.js";
import * as PuzzleString from "../app/puzzle-string.js";

describe("Puzzle Serializer", ()=>{
    it("should parse a puzzle from a string of emojis", ()=>{
        const puzzle = PuzzleString.parse(
            `Test Puzzle 1
            ⬜️2️⃣5️⃣3️⃣3️⃣2️⃣3️⃣3️⃣2️⃣
            1️⃣🟫⬜️⬜️⬜️⬜️⬜️⬜️⬜️
            4️⃣⬜️⬜️🟥🟥🟥⬜️🟥⬜️
            2️⃣⬜️🟥⬜️⬜️⬜️⬜️🟥⬜️
            2️⃣⬜️🟥⬜️👑⬜️🟥🐀⬜️
            3️⃣⬜️🟥⬜️⬜️⬜️🟥🟥⬜️
            4️⃣⬜️🟥🟥🟥🟥🐍⬜️⬜️
            2️⃣⬜️⬜️⬜️⬜️⬜️🟥⬜️🟫
            5️⃣🟫🟫🟫🟫⬜️⬜️⬜️🟫
            `
        );
        if (puzzle.nCols !== 8 || puzzle.nRows !== 8) {
            throw new Error("parsed puzzle incorrectly");
        }
    });

    it("should parse a puzzle from a decoded URI", ()=>{
        const spec = "Test Puzzle 1!.25332332!1!4!2!2...👑..🐀!3!4.....🐍!2!5";
        const puzzle = PuzzleString.parse(spec);
        if (puzzle.nCols !== 8 || puzzle.nRows !== 8) {
            throw new Error("parsed puzzle incorrectly");
        }
    });

    it("should serialize a puzzle into a URI without errors", ()=>{
        const spec = "Test Puzzle 1!.25332332!1!4!2!2...👑..🐀!3!4.....🐍!2!5";
        const puzzle = PuzzleString.parse(spec);
        const uri = PuzzleString.toURI(puzzle);
    });
});
