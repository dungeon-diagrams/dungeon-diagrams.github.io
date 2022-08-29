import { Puzzle } from "../app/puzzle-model.js";
import * as PuzzleString from "../app/puzzle-string.js";

describe("Puzzle Model", ()=>{
    it("should detect a completely unsolved puzzle", function(){
        const puzzle = PuzzleString.parse("Test Puzzle 1!.25332332!1!4!2!2...👑..🐀!3!4.....🐍!2!5");
        const {solved, reason} = puzzle.isSolved();
        if (solved) {
            throw new Error(`incorrectly thought an unsolved puzzle was solved: ${puzzle.name}: ${reason}`);
        }
    });

    it("should detect a correctly solved puzzle", function(){
        const puzzle = PuzzleString.parse("Example Dungeon!.424121!3***..💎!1*!2*.*!5*.****!1....*🐲!2🦁**");
        const {solved, reason} = puzzle.isSolved();
        if (!solved) {
            throw new Error(`incorrectly thought a solved puzzle was unsolved: ${puzzle.name}: ${reason}`);
        }
    });

    it("should detect disconnected halls", function(){
        const puzzle = PuzzleString.parse(
            `Test Puzzle 1
            .030
            1m*m
            1.*.
            1m*m
            `
        );
        const {solved, reason} = puzzle.isSolved();
        if (solved) {
            throw new Error(`incorrectly thought disconnected halls were solved: ${puzzle.name}: ${reason}`);
        }
    });

    it("should detect wide halls", function(){
        const puzzle = PuzzleString.parse(
            `Test Puzzle 2
            .002
            1..*
            1..*
            0..m
            `
        );
        const {solved, reason} = puzzle.isSolved();
        if (solved) {
            throw new Error(`incorrectly allowed a wide hall: ${puzzle.name}: ${reason}`);
        }
    });

    it("should detect wide halls outside treasure rooms", function(){
        const puzzle = PuzzleString.parse(
            `Test Puzzle 3
            .02222
            3..***
            3..***
            1.*t..
            0.....
            1m*...
            `
        );
        const {solved, reason} = puzzle.isSolved();
        if (solved) {
            throw new Error(`incorrectly allowed a wide hall: ${puzzle.name}: ${reason}`);
        }
    });

    it("should detect valid treasure rooms", function(){
        const puzzle = PuzzleString.parse(
            `Test Puzzle 4
            .11132
            2...**
            2...**
            0..t..
            4****m
            `
        );
        const {solved, reason} = puzzle.isSolved();
        if (!solved) {
            throw new Error(`incorrectly disallowed a valid treasure room: ${puzzle.name}: ${reason}`);
        }
    });

    it("should detect invalid treasure rooms", function(){
        const puzzle5 = PuzzleString.parse(
            `Test Puzzle 5
            .11132
            2....m
            2...**
            0..t..
            4****m
            `
        );
        const puzzle6 = PuzzleString.parse(
            `Test Puzzle 6
            .030
            1.t.
            1.*.
            1m*m
            `
        );
        for (const puzzle of [puzzle5, puzzle6]) {
            const {solved, reason} = puzzle.isSolved();
            if (solved) {
                throw new Error(`incorrectly allowed an invalid treasure room: ${puzzle.name}: ${reason}`);
            }
        }
    });
});
