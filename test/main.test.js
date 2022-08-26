// import {describe, expect, test} from '@jest/globals';
import "../app/main.js";

describe("Web Application", ()=> {
    test("should load in a browser", function(){
        if (typeof window === "undefined") {
            this.skip();
        }
        const appEl = document.querySelector(".app");
        if (!appEl) {
            throw new Error("App element was not present");
        }
    });
});
