import { h, Component } from "preact";
import { default as runes } from "runes";

import { Puzzle, EditablePuzzle, Tile, TileTypes } from "./puzzle-model.js";
import { PuzzleGrid } from "./puzzle-view.js";
import { Brush, EraseBrush, MonsterBrush, TreasureBrush, DesignBrush } from "./brush.js";

const { Monster, BossMonster, Treasure } = TileTypes;

type ToolType = "floor" | "wall" | "monster" | "treasure";

interface PuzzleEditorProps {
    puzzle: EditablePuzzle;
}

interface PuzzleEditorState {
    puzzle: EditablePuzzle;
    tool: ToolType;
    autoTarget: boolean;
    autoMonster: boolean;
    monsterGlyph: string;
    treasureGlyph: string;
}

export class PuzzleEditor extends Component<PuzzleEditorProps, PuzzleEditorState> {
    brushes = {
        floor: new EraseBrush(),
        wall: new DesignBrush(),
        monster: new MonsterBrush(),
        treasure: new TreasureBrush()
    };

    constructor(props: PuzzleEditorProps) {
        super(props);
        this.state = {
            puzzle: props.puzzle,
            tool: "wall",
            autoTarget: this.brushes.wall.autoTarget,
            autoMonster: this.brushes.wall.autoMonster,
            monsterGlyph: this.brushes.monster.glyph,
            treasureGlyph: this.brushes.treasure.glyph
        };
        Object.assign(globalThis, {puzEditor: this});
    }

    updatePuzzle = (event: Event)=>{
        const puzzle = event.target as EditablePuzzle;
        this.setState({puzzle });
    };

    componentDidMount() {
        this.state.puzzle.addEventListener("change", this.updatePuzzle);
        document.body.addEventListener("keydown", this.keyDown);
    }

    componentWillUnmount() {
        this.state.puzzle.removeEventListener("change", this.updatePuzzle);
        document.body.removeEventListener("keydown", this.keyDown);
    }

    keyDown = (event: KeyboardEvent)=>{
        const target = event.target as HTMLInputElement;
        if (target.tagName === "INPUT" && (target.type === "text" || target.type === "number")) {
            return;
        }
        const hotKeys: {[key:string]: ToolType} = {
            "1": "wall",
            "2": "monster",
            "3": "treasure",
            "4": "floor"
        };
        if (event.key in hotKeys) {
            const tool = hotKeys[event.key];
            this.brushes[this.state.tool].strokeEnd(this.props.puzzle);
            this.setState({tool});
        }
    };

    handleChange = (event: Event) => {
        const input = event.target as HTMLInputElement;
        const puzzle = this.state.puzzle;
        if (input.type === "checkbox") {
            // assume this is just for wall options :/
            Object.assign(this.brushes.wall, {[input.name]: input.checked});
            this.setState({[input.name]: input.checked});
        }
        else if (input.type === "radio") {
            this.brushes[this.state.tool].strokeEnd(this.props.puzzle);
            this.setState({[input.name]: input.value});
        }
        else if (input.name === "name") {
            puzzle.name = input.value;
        }
        else if (input.name === "nRows") {
            puzzle.setSize(parseInt(input.value, 10), puzzle.nCols, this.brushes.wall.autoTarget);
        }
        else if (input.name === "nCols") {
            puzzle.setSize(puzzle.nRows, parseInt(input.value, 10), this.brushes.wall.autoTarget);
        }
        else if (input.name === "rowTargets") {
            puzzle.setRowTargets(input.value.split(",").map((s:string)=>parseInt(s, 10)));
        }
        else if (input.name === "colTargets") {
            puzzle.setColTargets(input.value.split(",").map((s:string)=>parseInt(s, 10)));
        }
        else if (input.name === "monsterGlyph") {
            const glyphs = runes(input.value);
            const glyph = glyphs[glyphs.length-1];
			const tile = Tile.parse(glyph);
			if (tile instanceof Monster) {
                this.brushes.monster.glyph = glyph;
                this.brushes.wall.monsterGlyph = glyph;
                this.setState({monsterGlyph:glyph, tool: "monster"});
            }
        }
        else if (input.name === "treasureGlyph") {
            const glyphs = runes(input.value);
            const glyph = glyphs[glyphs.length-1];
            if (glyph.match(Treasure.pattern)) {
                this.brushes.treasure.glyph = glyph;
                this.setState({treasureGlyph:glyph, tool: "treasure"});
            }
        }
        this.setState({});
    };

    inputGlyph = (event:Event) => {
        const input = event.target as HTMLInputElement;
        if (input.name === "monsterGlyph" || input.name === "treasureGlyph") {
            this.handleChange(event);
        }
    };

    render() {
        const brush = this.brushes[this.state.tool];
        return (
            <div className="puzzle-editor">
                <div className="puzzle-editor-controls" onChange={this.handleChange}>
                    <fieldset>
                        <legend>Puzzle Properties</legend>
                        <label>
                            {"Name: "}
                            <input name="name" type="text" size={16} value={this.state.puzzle.name} />
                        </label>
                        <br />
                        <label>
                            {"Columns: "}
                            <input name="nCols" type="number" inputMode="numeric" pattern="[0-9]*" size={1} value={this.state.puzzle.nCols} />
                            <input name="colTargets" type="text" value={this.state.puzzle.colTargets.join(",")} />
                        </label>
                        <br />
                        <label>
                            {"Rows: "}
                            <input name="nRows" type="number" inputMode="numeric" pattern="[0-9]*" size={1} value={this.state.puzzle.nRows} />
                            <input name="rowTargets" type="text" value={this.state.puzzle.rowTargets.join(",")} />
                        </label>
                    </fieldset>
                    <br />
                    <fieldset>
                        <legend>Tool</legend>
                        <label>
                            <input name="tool" type="radio" value="wall" checked={this.state.tool=="wall"} />
                            Wall
                            <br /><input type="radio" style={{visibility:"hidden"}} />
                            <label>
                                Auto-place monsters: 
                                <input type="checkbox" name="autoMonster" checked={this.state.autoMonster} />
                            </label>
                            <br /><input type="radio" style={{visibility:"hidden"}} />
                            <label>
                                Auto-update counts: 
                                <input type="checkbox" name="autoTarget" checked={this.state.autoTarget} />
                            </label>
                        </label>
                        <br /><br />
                        <label>
                            <input name="tool" type="radio" value="monster" checked={this.state.tool=="monster"} />
                            Monster&nbsp;
                            <input name="monsterGlyph" type="text" size={1} value={this.state.monsterGlyph} onInput={this.inputGlyph} />
                        </label>
                        <br /><br />
                        <label>
                            <input name="tool" type="radio" value="treasure" checked={this.state.tool=="treasure"} />
                            Treasure&nbsp;
                            <input name="treasureGlyph" type="text" size={1} value={this.state.treasureGlyph} onInput={this.inputGlyph} />
                        </label>
                        <br /><br />
                        <label>
                            <input name="tool" type="radio" value="floor" checked={this.state.tool=="floor"} />
                            Erase
                        </label>
                    </fieldset>
                </div>
                <PuzzleGrid puzzle={this.state.puzzle} brush={brush} />
            </div>
        );
    }
}
