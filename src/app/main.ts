import { render } from "preact";
import { App } from "./app.js";

declare global {
    interface Window {
        runes: object;
        test: any;
        preact: object;
    }
}

render(App(), document.body, document.getElementById("app") as Element);
