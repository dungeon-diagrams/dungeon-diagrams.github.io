import { h, Component, createRef } from "preact";
import { default as runes } from "runes";

import { Puzzle, EditablePuzzle, Monster, Treasure, Tile } from "./puzzle-model.js";
import { PuzzleGrid } from "./puzzle-view.js";
import { Brush, EraseBrush, MonsterBrush, TreasureBrush, DesignBrush } from "./brush.js";

type ToolType = "floor" | "wall" | "monster" | "treasure";

interface PuzzleEditorProps {
    puzzle: EditablePuzzle;
}

interface PuzzleEditorState {
    puzzle: EditablePuzzle;
    tool: ToolType;
    autoTarget: boolean;
    autoMonster: boolean;
    monsterTile: Monster; // TODO: either store the glyph, or construct a brush from the tile
    treasureTile: Treasure;
}

export class PuzzleEditor extends Component<PuzzleEditorProps, PuzzleEditorState> {
    brush: Brush;

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
        this.brush = this.makeBrush();
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
        const hotKeys: {[key:string]: ToolType} = {
            '1': 'wall',
            '2': 'monster',
            '3': 'treasure',
            '4': 'floor'
        }
        if (event.key in hotKeys) {
            const tool = hotKeys[event.key];
            this.setState({tool});
            this.brush = this.makeBrush();
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
            this.brush = this.makeBrush();
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

    makeBrush(): Brush {
        let brush;
        if (this.state.tool === "floor") {
            brush = new EraseBrush();
        }
        else if (this.state.tool === "monster") {
            brush = new MonsterBrush();
            brush.glyph = this.state.monsterTile.toHTML();
        }
        else if (this.state.tool === "treasure") {
            brush = new TreasureBrush();
            brush.glyph = this.state.treasureTile.toHTML();
        }
        else { // "wall"
            brush = new DesignBrush();
            brush.autoMonster = this.state.autoMonster;
            brush.autoTarget = this.state.autoTarget;
        }
        return brush;
    }

    render() {
        return (
            <div className="puzzle-editor">
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
                <PuzzleGrid puzzle={this.state.puzzle} brush={this.brush} editAfterSolve={true} />
            </div>
        )
    }
}
