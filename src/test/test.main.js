import "../app/main.js";

describe("Web Application", ()=> {
    it("should load in a browser", async function(){
        if (typeof window === "undefined") {
            this.skip();
        }
        await import("../app/main.js");
        const errorDisplay = document.querySelector('#status-display[data-status="Error"]');
        if (errorDisplay) {
            throw new Error(errorDisplay.textContent);
        }
        const appEl = document.querySelector(".app");
        if (!appEl) {
            throw new Error("App element was not present");
        }
    });
});
