import * as preact from "preact";
import { default as runes } from "runes";
import { App } from "./app.js";
import * as PuzzleModel from "./puzzle-model.js";
import { PuzzleGrid } from "./puzzle-view.js";
import * as PuzzleString from "./puzzle-string.js";

// debugging
declare global {
    interface Window {
        runes: Function;
        preact: object;
        puzzle: any;
        test: any;
    }
}

// preload modules
Object.assign(globalThis, {
    runes: runes,
    preact: preact,
    Puzzle: PuzzleModel.Puzzle,
    Tile: PuzzleModel.Tile,
    PuzzleString: PuzzleString
}, PuzzleModel.TileTypes);
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

if (typeof(document) !== 'undefined') {
    if (document.readyState === "loading") {
        window.addEventListener("DOMContentLoaded", init);
    }
    else {
        init();
    }
}
