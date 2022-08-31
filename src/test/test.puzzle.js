import { Puzzle } from "../app/puzzle-model.js";
import * as PuzzleString from "../app/puzzle-string.js";

describe("Puzzle Model", ()=>{
    it("should detect a completely unsolved puzzle", function(){
        const puzzle = PuzzleString.parse("Unsolved Puzzle!.25332332!1!4!2!2...👑..🐀!3!4.....🐍!2!5");
        const {solved, reason} = puzzle.isSolved();
        if (solved) {
            throw new Error(`incorrectly thought an unsolved puzzle was solved: ${puzzle.name}: ${reason}`);
        }
    });

    it("should detect a correctly solved puzzle", function(){
        const puzzle = PuzzleString.parse("Solved Puzzle!.424121!3***..💎!1*!2*.*!5*.****!1....*🐲!2🦁**");
        const {solved, reason} = puzzle.isSolved();
        if (!solved) {
            throw new Error(`incorrectly thought a solved puzzle was unsolved: ${puzzle.name}: ${reason}`);
        }
    });

    it("should detect valid dead ends", function(){
        const puzzle = PuzzleString.parse(
            `Valid Dead Ends
            .3223
            4****
            2*mm*
            4****
            `
        );
        const {solved, reason} = puzzle.isSolved();
        if (!solved) {
            throw new Error(`incorrectly thought dead ends were unsolved: ${puzzle.name}: ${reason}`);
        }
    });

    it("should detect invalid dead ends", function(){
        const puzzle = PuzzleString.parse(
            `Invalid Dead Ends
            .3223
            4****
            2*.m*
            4****
            `
        );
        const {solved, reason} = puzzle.isSolved();
        if (solved) {
            throw new Error(`incorrectly thought dead ends were solved: ${puzzle.name}: ${reason}`);
        }
    });

    it("should detect disconnected halls", function(){
        const puzzle = PuzzleString.parse(
            `Invalid Disconnected Halls
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
            `Invalid Wide Halls
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
            `Invalid Wide Halls 2
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
            `Valid Treasure Room
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
            `Invalid Treasure Room with 2 exits
            .11132
            2....m
            2...**
            0..t..
            4****m
            `
        );
        const puzzle6 = PuzzleString.parse(
            `Invalid Treasure outside Treasure Room
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
