import { h, Component, createRef } from "preact";
import { Puzzle, EditablePuzzle, Monster, Treasure, Tile } from "./puzzle-model.js";
import { PuzzleGrid } from "./puzzle-view.js";

interface PuzzleEditorProps {
    puzzle: EditablePuzzle;
}

interface PuzzleEditorState {
    puzzle: EditablePuzzle;
    tool: string;
    autoTarget: boolean;
    autoMonster: boolean;
    monsterTile: Monster;
    treasureTile: Treasure;
}

export class PuzzleEditor extends Component<PuzzleEditorProps, PuzzleEditorState> {
    ref = createRef();

    constructor(props: PuzzleEditorProps) {
        super(props);
        this.state = {
            puzzle: props.puzzle,
            tool: "wall",
            autoTarget: true,
            autoMonster: true,
            monsterTile: new Monster(),
            treasureTile: new Treasure()
        };
        Object.assign(globalThis, {puzEditor: this});
    }

    updatePuzzle = (event: Event)=>{
        const puzzle = event.target as EditablePuzzle;
        this.setState({puzzle: puzzle });
    }

    componentDidMount() {
        this.state.puzzle.addEventListener('change', this.updatePuzzle);
    }

    componentWillUnmount() {
        this.state.puzzle.removeEventListener('change', this.updatePuzzle);
    }

    updateValues = (event: Event) => {
        const values = readForm(this.ref.current);

        const puzzle = this.state.puzzle;
        puzzle.name = values.name;
        puzzle.setSize(values.nRows, values.nCols);
        puzzle.rowTargets = values.rowTargets.split(',').map((s:string)=>parseInt(s));
        puzzle.colTargets = values.colTargets.split(',').map((s:string)=>parseInt(s));

        let monsterTile = this.state.monsterTile;
        if (values.monsterGlyph != monsterTile.emoji) {
            monsterTile = new Monster();
            monsterTile.setGlyph(values.monsterGlyph);
        }
        let treasureTile = this.state.treasureTile;
        if (values.treasureGlyph != treasureTile.emoji) {
            treasureTile = new Treasure();
            treasureTile.setGlyph(values.treasureGlyph);
        }

        this.setState({
            puzzle,
            tool: values.tool,
            autoTarget: values['auto-target'],
            autoMonster: values['auto-monster'],
            monsterTile,
            treasureTile,
        });
    }

    render() {
        return (
            <div className="puzzle-editor" ref={this.ref}>
                <div className="puzzle-editor-controls">
                    <fieldset onChange={this.updateValues}>
                        <legend>Puzzle Properties</legend>
                        <label>
                            {"Name: "}
                            <input name="name" type="text" size={16} value={this.state.puzzle.name} />
                        </label>
                        <br/>
                        <label>
                            {"Columns: "}
                            <input name="nCols" type="number" inputMode="numeric" pattern="[0-9]*" size={1} value={this.state.puzzle.nCols} />
                            <input name="colTargets" type="text" value={this.state.puzzle.colTargets.join(',')} />
                        </label>
                        <br/>
                        <label>
                            {"Rows: "}
                            <input name="nRows" type="number" inputMode="numeric" pattern="[0-9]*" size={1} value={this.state.puzzle.nRows} />
                            <input name="rowTargets" type="text" value={this.state.puzzle.rowTargets.join(',')} />
                        </label>
                        <br/>
                        <label>
                            <input name="auto-target" type="checkbox" checked={this.state.autoTarget} /> Auto-count walls
                        </label>
                    </fieldset>
                    <br />
                    <fieldset onChange={this.updateValues}>
                        <legend>Tool</legend>
                        <label>
                            <input name="tool" type="radio" value="wall" checked={this.state.tool=="wall"} />
                            Wall
                            <label>
                                <input type="checkbox" name="auto-monster" checked={this.state.autoMonster} />
                                Auto-monster
                            </label>
                        </label>
                        <br />
                        <label>
                            <input name="tool" type="radio" value="monster" checked={this.state.tool=="monster"} />
                            Monster&nbsp;
                            <input name="monsterGlyph" type="text" size={1} value={this.state.monsterTile.emoji} />
                        </label>
                        <br />
                        <label>
                            <input name="tool" type="radio" value="treasure" checked={this.state.tool=="treasure"} />
                            Treasure&nbsp;
                            <input name="treasureGlyph" type="text" size={1} value={this.state.treasureTile.emoji} />
                        </label>
                        <br/>
                        <label>
                            <input name="tool" type="radio" value="floor" checked={this.state.tool=="floor"} />
                            Erase
                        </label>
                    </fieldset>
                </div>
                <PuzzleGrid puzzle={this.state.puzzle} />
            </div>
        )
    }
}

function readForm(form: HTMLElement) {
    const values: {[key:string]: any} = {};
    const inputs = form.querySelectorAll('[name]');
    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i] as HTMLInputElement;
        if (input.type === 'checkbox') {
            values[input.name] = input.checked;
        }
        else if (input.type === 'radio') {
            if (input.checked) {
                values[input.name] = input.value;
            }
        }
        else if (input.type === 'number') {
            values[input.name] = parseInt(input.value);
        }
        else {
            values[input.name] = input.value;
        }
    }
    return values;
}
