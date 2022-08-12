import * as preact from "preact";
import { default as runes } from "runes";
import { App } from "./app.js";
import { Tile, Puzzle } from "./puzzle-model.js";
import { PuzzleCell, PuzzleGrid } from "./puzzle-view.js";
import { TileString, PuzzleString } from "./puzzle-string.js";

// debugging
declare global {
    interface Window {
        runes: Function;
        preact: object;
        Tile: Function;
        Puzzle: Function;
        TileString: object;
        PuzzleString: object;
        puzzle: any;
        test: any;
    }
}

// preload modules
window.runes = runes;
window.preact = preact;
window.Tile = Tile;
window.Puzzle = Puzzle;
window.TileString = TileString;
window.PuzzleString = PuzzleString;
PuzzleGrid;
App;

export function init() {
    try {
        preact.render(App(), document.body, document.getElementById("app") as Element);
    }
    catch (e: any) {
        const statusDisplay = document.getElementById("status-display");
        if (statusDisplay) {
            statusDisplay.dataset.status = "Error";
            statusDisplay.innerText = `${e.name || "Error"}: ${e.message || e}`
        }
    }
}

if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", init);
}
else {
    init();
}
