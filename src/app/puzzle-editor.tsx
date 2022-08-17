import { h, Component, createRef } from "preact";
import { default as runes } from "runes";

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
        document.body.addEventListener('keyup', this.keyUp);
    }

    componentWillUnmount() {
        this.state.puzzle.removeEventListener('change', this.updatePuzzle);
        document.body.removeEventListener('keyup', this.keyUp);
    }

    keyUp = (event: KeyboardEvent)=>{
        if ((event.target as HTMLElement).tagName === 'INPUT') {
            return;
        }
        if (event.key == '1') {
            this.setState({tool: "wall"});
        }
        else if (event.key == '2') {
            this.setState({tool: "monster"});
        }
        else if (event.key == '3') {
            this.setState({tool: "treasure"});
        }
        else if (event.key == '4') {
            this.setState({tool: "floor"});
        }
    }

    handleChange = (event: Event) => {
        const input = event.target as HTMLInputElement;
        const puzzle = this.state.puzzle;
        if (input.type === 'checkbox') {
            this.setState({[input.name]: input.checked});
        }
        else if (input.type === 'radio') {
            this.setState({[input.name]: input.value});
        }
        else if (input.name === 'name') {
            puzzle.name = input.value;
        }
        else if (input.name === 'nRows') {
            puzzle.setSize(parseInt(input.value), puzzle.nCols);
        }
        else if (input.name === 'nCols') {
            puzzle.setSize(puzzle.nRows, parseInt(input.value));
        }
        else if (input.name === 'rowTargets') {
            puzzle.setRowTargets(input.value.split(',').map((s:string)=>parseInt(s)));
        }
        else if (input.name === 'colTargets') {
            puzzle.setColTargets(input.value.split(',').map((s:string)=>parseInt(s)));
        }
        else if (input.name === 'monsterGlyph') {
            const glyph = runes(input.value)[0];
            const monsterTile = Monster.parse(glyph);
            if (monsterTile instanceof Monster) {
                monsterTile.emoji = glyph; // TODO
                this.setState({monsterTile, tool: "monster"});
            }
        }
        else if (input.name === 'treasureGlyph') {
            const glyph = runes(input.value)[0];
            const treasureTile = Treasure.parse(glyph);
            if (treasureTile instanceof Treasure) {
                treasureTile.emoji = glyph; // TODO
                this.setState({treasureTile, tool: "monster"});
            }
        }
        this.setState({});
    }

    render() {
        return (
            <div className="puzzle-editor" ref={this.ref}>
                <div className="puzzle-editor-controls" onChange={this.handleChange}>
                    <fieldset>
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
                    </fieldset>
                    <br />
                    <fieldset>
                        <legend>Tool</legend>
                        <label>
                            <input name="tool" type="radio" value="wall" checked={this.state.tool=="wall"} />
                            Wall
                            <br/><input type="radio" style={{visibility:"hidden"}} />
                            <label>
                                Auto-place monsters: 
                                <input type="checkbox" name="autoMonster" checked={this.state.autoMonster} />
                            </label>
                            <br/><input type="radio" style={{visibility:"hidden"}} />
                            <label>
                                Auto-update counts: 
                                <input type="checkbox" name="autoTarget" checked={this.state.autoTarget} />
                            </label>
                        </label>
                        <br/><br/>
                        <label>
                            <input name="tool" type="radio" value="monster" checked={this.state.tool=="monster"} />
                            Monster&nbsp;
                            <input name="monsterGlyph" type="text" size={1} value={this.state.monsterTile.emoji} />
                        </label>
                        <br/><br/>
                        <label>
                            <input name="tool" type="radio" value="treasure" checked={this.state.tool=="treasure"} />
                            Treasure&nbsp;
                            <input name="treasureGlyph" type="text" size={1} value={this.state.treasureTile.emoji} />
                        </label>
                        <br/><br/>
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
