import { h, Component } from "preact";
import { Puzzle, EditablePuzzle, Monster, Treasure, Tile } from "./puzzle-model.js";
import { PuzzleGrid } from "./puzzle-view.js";

interface PuzzleEditorProps {
    puzzle: EditablePuzzle;
}

interface PuzzleEditorState {
    puzzle: EditablePuzzle;
    tool: string;
    monsterTile: Monster;
    treasureTile: Treasure;
}

export class PuzzleEditor extends Component<PuzzleEditorProps, PuzzleEditorState> {
    constructor(props: PuzzleEditorProps) {
        super(props);
        this.state = {
            puzzle: props.puzzle,
            tool: "wall",
            monsterTile: new Monster(),
            treasureTile: new Treasure()
        };
        Object.assign(globalThis, {puzEditor: this});
    }

    setCols = (event: Event) => {
        const value = parseInt((event.target as HTMLInputElement).value);
        this.state.puzzle.setSize(this.state.puzzle.nRows, value);
    }

    setRows = (event: Event) => {
        const value = parseInt((event.target as HTMLInputElement).value);
        this.state.puzzle.setSize(value, this.state.puzzle.nCols);
    }

    setName = (event: Event) => {
        const value = (event.target as HTMLInputElement).value;
        this.state.puzzle.name = value;
        this.state.puzzle.didChange();
    }

    setTool = (event: Event) => {
        const target = event.target as HTMLInputElement;
        this.setState({tool: target.value});
    }

    render() {
        return (
            <div className="puzzle-editor">
                <div className="puzzle-editor-controls">
                <fieldset style={{display:"inline-block"}}>
                    <legend>Puzzle Properties</legend>
                        <input type="text" size={16} value={this.state.puzzle.name} onChange={this.setName}/>
                        {" "}
                        <input type="number" inputMode="numeric" pattern="[0-9]*" size={1} value={this.state.puzzle.nCols} onChange={this.setCols}></input>
                        ✕
                        <input type="number" inputMode="numeric" pattern="[0-9]*" size={1} value={this.state.puzzle.nRows} onChange={this.setRows}></input>
                    </fieldset>
                    <br />
                    <fieldset style={{display:"inline-block"}}>
                        <legend>Tool</legend>
                        <label>
                            <input type="radio" name="tool" value="wall" checked={this.state.tool=="wall"} onChange={this.setTool} />
                            Wall
                        </label>
                        <label>
                            <input type="radio" name="tool" value="monster" checked={this.state.tool=="monster"} onChange={this.setTool} />
                            Monster&nbsp;
                            <input type="text" size={1} value={this.state.monsterTile.emoji}/>
                        </label>
                        <label>
                            <input type="radio" name="tool" value="treasure" checked={this.state.tool=="treasure"} onChange={this.setTool} />
                            Treasure&nbsp;
                            <input type="text" size={1} value={this.state.treasureTile.emoji}/>
                        </label> 
                    </fieldset>
                </div>
                <PuzzleGrid puzzle={this.state.puzzle} />
            </div>
        )
    }
}
