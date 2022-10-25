import { App } from "../app/app.js";

describe("App Component (router)", ()=>{
    it("should render the home page without errors", ()=>{
        new App({search:"?"});
    });

    it("should render a puzzle without errors", ()=>{
        new App({search:"?puzzle_id=0"});
    });

    it("should render the editor without errors", ()=>{
        new App({search:"?mode=edit"});
    });
});
