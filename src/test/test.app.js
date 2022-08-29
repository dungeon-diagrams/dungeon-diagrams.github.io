import { App } from "../app/app.js";

describe("App Component (router)", ()=>{
    it("should render the home page without errors", ()=>{
        App("?");
    });

    it("should render a puzzle without errors", ()=>{
        App("?puzzle_id=0");
    });

    it("should render the editor without errors", ()=>{
        App("?mode=edit");
    });
});
