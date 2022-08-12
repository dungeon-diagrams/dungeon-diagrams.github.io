import { render, App } from '../app/app.js';

describe('App Component', ()=>{
    it('should render the home page without errors', ()=>{
        App('?');
    })

    it('should render a puzzle without errors', ()=>{
        App('?puzzle_id=0');
    })
})
