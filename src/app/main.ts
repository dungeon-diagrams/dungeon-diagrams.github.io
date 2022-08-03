import { render } from "preact";
import { App } from "./app.js";

render(App(), document.body, document.getElementById("app") as Element);
