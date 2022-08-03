import { render } from "preact";
import { App } from "./app.js";

window.addEventListener('DOMContentLoaded', (event) => {
    render(App(), document.body, document.getElementById("app") as Element);
})
