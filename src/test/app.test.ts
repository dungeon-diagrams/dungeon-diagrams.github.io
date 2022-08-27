import {describe, expect, test} from '@jest/globals';
import { App } from "../app/app.js";

describe("App Component", ()=>{
    test("should render the home page without errors", ()=>{
        const app = App("?");
    });

    test("should render a puzzle without errors", ()=>{
        const app = App("?puzzle_id=0");
    });

    test("should render the editor without errors", ()=>{
        const app = App("?mode=edit");
    });
});
