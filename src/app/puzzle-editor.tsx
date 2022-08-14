import { h, Component } from "preact";
import { Puzzle, EditablePuzzle, Monster, BossMonster, Tile } from "./puzzle-model.js";
import { PuzzleGrid } from "./puzzle-view.js";

interface PuzzleEditorProps {
    puzzle: EditablePuzzle;
}

interface PuzzleEditorState {
    puzzle: EditablePuzzle;
    monsterTile: Monster;
    bossTile: BossMonster;
}


export class PuzzleEditor extends Component<PuzzleEditorProps, PuzzleEditorState> {
    constructor(props: PuzzleEditorProps) {
        super(props);
        this.state = {
            puzzle: props.puzzle,
            monsterTile: new Monster(),
            bossTile: new BossMonster()
        };
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

    render() {
        return (
            <div className="puzzle-editor">
                <PuzzleGrid puzzle={this.state.puzzle} />
                <div className="puzzle-editor-controls">
                    <input type="text" size={16} value={this.state.puzzle.name} onChange={this.setName}/>
                    {" "}
                    <input type="number" size={1} value={this.state.puzzle.nCols} onChange={this.setCols}></input>
                    ✕
                    <input type="number" size={1} value={this.state.puzzle.nRows} onChange={this.setRows}></input>
                    {" "}
                    <button>{this.state.monsterTile.emoji}</button>
                    <button>{this.state.bossTile.emoji}</button>
                </div>
            </div>
        )
    }
}
