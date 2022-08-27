import {describe, expect, it} from '@jest/globals';
import "../app/main.js";

describe("Web Application", ()=> {
    if (typeof window === "undefined") {
        it.skip("should load in a browser", function(){});
    }
    else {
        it("should load in a browser", function(){
            const appEl = document.querySelector(".app");
            if (!appEl) {
                throw new Error("App element was not present");
            }
        });    
    }
});
