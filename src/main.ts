import { h, Component, render } from "preact";
import { sayHello } from "./widget.js";

const el = document.getElementById("greeting");
if (el) {
    el.innerHTML = '';
    render(sayHello("here"), el);
}
