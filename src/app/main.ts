import * as preact from "preact";
import { default as runes } from "runes";
import { App } from "./app.js";
import * as PuzzleModel from "./puzzle-model.js";
import { Tile, TileTypes } from "./tile.js";
import { PuzzleGrid } from "./puzzle-view.js";
import { PuzzleEditor } from "./puzzle-editor.js";
import * as PuzzleString from "./puzzle-string.js";
import * as HTMLUtils from "./html-utils.js";
import * as Brush from "./brush.js";
import { appSettings } from "./settings.js";

// debugging
declare global {
    interface Window {
        runes: ((s:string)=>string[]);
        preact: object;
        puzzle: PuzzleModel.Puzzle;
    }
}

// preload modules
Object.assign(globalThis, {
    runes,
    preact,
    Puzzle: PuzzleModel.Puzzle,
    Tile,
    PuzzleString,
    appSettings
}, TileTypes);
Brush;
PuzzleGrid;
PuzzleEditor;
App;
HTMLUtils;

export function init() {
    try {
        preact.render(App(), document.body, document.getElementById("app") as Element);
    }
    catch (e: unknown) {
        console.error(e);
        const statusDisplay = document.getElementById("status-display");
        if (statusDisplay) {
            statusDisplay.dataset.status = "Error";
            if (e instanceof Error) {
                statusDisplay.innerText = `${e.name}: ${e.message}`;
            }
            else {
                statusDisplay.innerText = `Error: ${e}`;
            }
        }
    }
}

if (typeof(document) !== "undefined") {
    if (document.readyState === "loading") {
        window.addEventListener("DOMContentLoaded", init);
    }
    else {
        init();
    }
}
