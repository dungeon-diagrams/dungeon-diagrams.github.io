import { Puzzle } from "../app/puzzle-model.js";
import * as PuzzleString from "../app/puzzle-string.js";

describe("Puzzle Model", ()=>{
    it("should detect a completely unsolved puzzle", function(){
        const puzzle = PuzzleString.parse("Test Puzzle 1!.25332332!1!4!2!2...👑..🐀!3!4.....🐍!2!5");
        const {solved, reason} = puzzle.isSolved();
        if (solved) {
            throw new Error(`incorrectly thought an unsolved puzzle was solved: ${reason}`);
        }
    });

    it("should detect a correctly solved puzzle", function(){
        const puzzle = PuzzleString.parse("Example Dungeon!.424121!3***..💎!1*!2*.*!5*.****!1....*🐲!2🦁**");
        const {solved, reason} = puzzle.isSolved();
        if (!solved) {
            throw new Error(`incorrectly thought a solved puzzle was unsolved: ${reason}`);
        }
    });

    it("should detect disconnected halls", function(){
        const puzzle = PuzzleString.parse(
            `Test Puzzle
            .030
            1m*m
            1.*.
            1m*m
            `
        );
        const {solved, reason} = puzzle.isSolved();
        if (solved) {
            throw new Error(`incorrectly thought disconnected halls were solved: ${reason}`);
        }
    });
});
