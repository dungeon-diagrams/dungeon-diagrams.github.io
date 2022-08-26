import { h, Component } from "preact";
import { Puzzle, Tile } from "./puzzle-model.js";
import { Brush, SolveBrush } from "./brush.js";
import * as PuzzleString from "./puzzle-string.js";

interface PuzzleGridProps {
    puzzle: Puzzle;
    brush: Brush;
}

interface PuzzleGridState {
    puzzle: Puzzle;
    size: {width: number, height: number};
}

export function PuzzleSolver(props: {puzzle: Puzzle}) {
    const { puzzle } = props;
    const brush = new SolveBrush();
    return (
        <PuzzleGrid {...{puzzle, brush}} />
    );
}

/**
 * PuzzleGrid displays a Puzzle.
 * It scales tiles to the available space and converts events
 * from mouse or touchscreen into [row, tile] coordinates.
 * A Brush object performs painting operations on those coordinates.
 */
export class PuzzleGrid extends Component<PuzzleGridProps, PuzzleGridState> {
    constructor(props: {puzzle: Puzzle}) {
        super();
        this.state = {
            puzzle: props.puzzle,
            size: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
    }

    updatePuzzle = (event: Event)=>{
        const puzzle = event.target as Puzzle;
        this.setState({
            puzzle
        });
    };

    updateSize = (event?: Event)=>{
        this.setState({
            size: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        });
    };

    componentDidMount() {
        this.state.puzzle.addEventListener("change", this.updatePuzzle);
        window.addEventListener("resize", this.updateSize);
        window.addEventListener("blur", this.strokeEnd);
        window.addEventListener("mouseup", this.strokeEnd);
    }

    componentWillUnmount() {
        this.state.puzzle.removeEventListener("change", this.updatePuzzle);
        window.removeEventListener("resize", this.updateSize);
        window.removeEventListener("blur", this.strokeEnd);
        window.removeEventListener("mouseup", this.strokeEnd);
    }

    getTile(x: number, y: number): [number, number, Tile | null] | [null, null, null] {
        const targetEl = document.elementFromPoint(x, y) as HTMLElement | null;
        if (targetEl?.classList.contains("puzzle-cell")) {
            const row = parseInt(targetEl.dataset.row || "", 10);
            const col = parseInt(targetEl.dataset.col || "", 10);
            const tile = this.state.puzzle.getTile(row, col);
            return [row, col, tile];
        }
        return [null, null, null];
    }

    mouseDown = (event: MouseEvent) => {
        event.preventDefault();
        if (this.props.brush.activeTile) {
            return;
        }
        const eventType = event.button == 2 ? "rightClick": "leftClick";
        const [row, col, tile] = this.getTile(event.clientX, event.clientY);
        if (tile != null) {
            this.props.brush.strokeStart(this.props.puzzle, row, col, eventType);
        }
    };

    mouseMove = (event: MouseEvent) => {
        if (this.props.brush.activeTile) {
            event.preventDefault();
            const [row, col, tile] = this.getTile(event.clientX, event.clientY);
            if (tile != null) {
                this.props.brush.strokeMove(this.props.puzzle, row, col);
            }
        }
    };

    strokeEnd = (event: Event) => {
        if (this.props.brush.activeTile) {
            setTimeout(()=>{
                this.props.brush.strokeEnd(this.props.puzzle);
            }, 100);
        }
    };

    touchStart = (event: TouchEvent) => {
        event.preventDefault();
        if (this.props.brush.activeTile) {
            return;
        }
        const eventType = "touch";
        for (let i = 0; i < event.targetTouches.length; i++) {
            const touch = event.targetTouches[i];
            const [row, col, tile] = this.getTile(touch.clientX, touch.clientY);
            if (tile != null) {
                this.props.brush.strokeStart(this.props.puzzle, row, col, eventType);
            }
        }
    };

    touchMove = (event: TouchEvent) => {
        if (this.props.brush.activeTile) {
            for (let i = 0; i < event.targetTouches.length; i++) {
                const touch = event.targetTouches[i];
                const [row, col, tile] = this.getTile(touch.clientX, touch.clientY);
                if (tile != null) {
                    this.props.brush.strokeMove(this.props.puzzle, row, col);
                }
            }
        }
    };

    touchEnd = (event: TouchEvent) => {
        if (event.targetTouches.length == 0) {
            this.strokeEnd(event);
        }
    };

    render() {
        const puzzle = this.state.puzzle;
        const {rowCounts, colCounts} = puzzle.countWalls();
        const rowStatus = [...getWallStatus(rowCounts, puzzle.rowTargets)];
        const colStatus = [...getWallStatus(colCounts, puzzle.colTargets)];
        const {solved, reason} = puzzle.isSolved();

        const maxCellHeight = (this.state.size.height - 110) / (puzzle.nRows + 1.5) - 2;
        const maxCellWidth = this.state.size.width / (puzzle.nCols + 1) - 2;
        const cellSize = Math.floor(Math.min(maxCellHeight, maxCellWidth));
        // const gridHeight = (cellSize+3) * (puzzle.nRows + 1) - 4;
        // const gridWidth = (cellSize+3) * (puzzle.nCols + 1) - 4;

        return (
            <div className={`puzzle-view ${solved?"solved":"unsolved"}`}>
                <h2>
                    <span className='solved-marker'> ⭐️ </span>
                    <a href={PuzzleString.toURI(puzzle)}>{puzzle.name}</a>
                    <span className='solved-marker'> ⭐️ </span>
                </h2>
                <style>
                    {`
                        body {overflow: hidden;}
                        .puzzle-grid td {width:  ${cellSize}px;}
                        .puzzle-grid tr {height: ${cellSize}px;}`
                    }
                </style>
                <table className="puzzle-grid"
                    style={{fontSize: cellSize*2/3}}
                    onContextMenu={stopEvent}
                    onMouseDown={this.mouseDown}
                    onMouseMove={this.mouseMove}
                    onTouchStart={this.touchStart}
                    onTouchMove={this.touchMove}
                    onTouchEnd={this.touchEnd}
                    onTouchCancel={this.touchEnd}    
                >
                    <tbody>
                        <tr>
                            <th />
                            {puzzle.colTargets.map((count, col) => (
                                <th key={col} className={`puzzle-wall-target ${colStatus[col]}`} data-col={col}>
                                    {count}
                                </th>
                            ))}
                        </tr>
                        {puzzle.tiles.map((rowTiles, row)=>(
                            <tr key={row}>
                                <th className={`puzzle-wall-target ${rowStatus[row]}`} data-row={row}>
                                    {puzzle.rowTargets[row]}&nbsp;
                                </th>
                                {rowTiles.map((tile, col)=>(
                                    <PuzzleCell key={col} row={row} col={col} tile={tile} puzzle={puzzle} rowStatus={rowStatus[row]} colStatus={colStatus[col]} />
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

function * getWallStatus(current: number[], expected: number[]) {
    for (let i = 0; i < current.length; i++) {
        if (current[i] < expected[i]) {
            yield "too-few-walls";
        }
        else if (current[i] > expected[i]) {
            yield "too-many-walls";
        }
        else {
            yield "correct-walls";
        }
    }
}

interface CellProps {
    row: number;
    col: number;
    tile: Tile;
    puzzle: Puzzle;
    rowStatus: string;
    colStatus: string;
}

/**
 * A PuzzleCell is a view of a single Tile.
 * clicking (touching) a cell begins a drag with the next tile type.
 * each cell touched with that drag converts to the drag's tile type if possible.
 */
export function PuzzleCell(props: CellProps) {
    return (
        <td className={`puzzle-cell ${props.rowStatus} ${props.colStatus}`}
            data-tile={props.tile.constructor.name}
            data-row={props.row}
            data-col={props.col}
            onContextMenu={stopEvent}
        >
            {props.tile.toHTML()}
        </td>
    );
}

function stopEvent(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return false;
}
