import { h, Component } from "preact";
import { Puzzle, Tile } from "./puzzle-model.js";
import { PuzzleString, TileString } from "./puzzle-string.js";

interface PuzzleGridProps {
    puzzle: Puzzle
}

interface PuzzleGridState {
    puzzle: Puzzle,
    size: {width: number, height: number}
}

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
            puzzle: puzzle
        });
    }

    updateSize = (event?: Event)=>{
        this.setState({
            size: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        })
    }

    componentDidMount() {
        this.state.puzzle.addEventListener('change', this.updatePuzzle);
        window.addEventListener('resize', this.updateSize);
    }

    componentWillUnmount() {
        this.state.puzzle.removeEventListener('change', this.updatePuzzle);
        window.removeEventListener('resize', this.updateSize);
    }

    swipeTile: Tile | null = null;

    mouseDown = (event: MouseEvent) => {
        event.preventDefault();
        this.swipeStart(event);
    }

    mouseMove = (event: MouseEvent) => {
        event.preventDefault();
        this.swipeMove(event);
    }

    swipeStart = (event: MouseEvent | Touch)=> {
        if (this.swipeTile) {
            return;
        }
        const targetEl = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
        if (targetEl?.classList.contains("puzzle-cell")) {
            const row = parseInt(targetEl.dataset.row || '');
            const col = parseInt(targetEl.dataset.col || '');
            const tile = this.state.puzzle.getTile(row, col);
            if (tile) {
                this.swipeTile = tile.nextTile();
                this.state.puzzle.setTile(row, col, this.swipeTile);
            }
        }
    }

    swipeMove = (event: MouseEvent | Touch)=> {
        if (!this.swipeTile) { 
            return;
        }
        const targetEl = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
        if (targetEl?.classList.contains("puzzle-cell")) {
            const row = parseInt(targetEl.dataset.row || '');
            const col = parseInt(targetEl.dataset.col || '');
            const tile = this.state.puzzle.getTile(row, col);
            if (tile) {
                this.state.puzzle.setTile(row, col, this.swipeTile);
            }
        }
    }

    swipeEnd = (event: Event)=> {
        setTimeout(()=>{
            this.swipeTile = null;
            if (this.state.puzzle.isSolved().solved) {
                this.state.puzzle.unmarkFloors();
            }
        }, 100);
    }

    touchStart = (event: TouchEvent) => {
        if (this.swipeTile) {
            return;
        }
        for (let i = 0; i < event.touches.length; i++) {
            this.swipeStart(event.touches[i])
        }
    }

    touchMove = (event: TouchEvent) => {
        for (let i = 0; i < event.touches.length; i++) {
            this.swipeMove(event.touches[i])
        }
    }

    render() {
        const puzzle = this.state.puzzle;
        const {rowCounts, colCounts} = puzzle.countWalls();
        const rowStatus = [...getWallStatus(rowCounts, puzzle.rowTargets)];
        const colStatus = [...getWallStatus(colCounts, puzzle.colTargets)];
        const {solved, reason} = puzzle.isSolved();

        const maxCellHeight = (this.state.size.height - 100) / (puzzle.nRows + 1) - 2;
        const maxCellWidth = this.state.size.width / (puzzle.nCols + 1) - 2;
        const cellSize = Math.floor(Math.min(maxCellHeight, maxCellWidth));
        // const gridHeight = (cellSize+3) * (puzzle.nRows + 1) - 4;
        // const gridWidth = (cellSize+3) * (puzzle.nCols + 1) - 4;

        return (
            <div className={`puzzle-view ${solved?'solved':'unsolved'}`}
                onMouseDown={this.mouseDown}
                onMouseMove={this.mouseMove}
                onMouseUp={this.swipeEnd}
                onTouchStart={this.touchStart}
                onTouchMove={this.touchMove}
                onTouchEnd={this.swipeEnd}
                onTouchCancel={this.swipeEnd}
            >
                <style>
                    {`.puzzle-grid td {width:  ${cellSize}px;}
                      .puzzle-grid tr {height: ${cellSize}px;}`
                    }
                </style>
                <h2>
                    <span className='solved-marker'> ⭐️ </span>
                    <a href={'?puzzle=' + encodeURIComponent(PuzzleString.toURI(puzzle))}>{puzzle.name}</a>
                    <span className='solved-marker'> ⭐️ </span>
                </h2>
                <table className="puzzle-grid" style={{fontSize: cellSize*2/3}}>
                    <tbody>
                        <tr>
                            <th></th>
                            {puzzle.colTargets.map((count, col) => (
                                <th className={`puzzle-wall-target ${colStatus[col]}`} data-col={col}>
                                    {count}
                                </th>
                            ))}
                        </tr>
                        {puzzle.tiles.map((rowTiles, row)=>(
                            <tr>
                                <th className={`puzzle-wall-target ${rowStatus[row]}`} data-row={row}>
                                    {puzzle.rowTargets[row]}&nbsp;
                                </th>
                                {rowTiles.map((tile, col)=>(
                                    <PuzzleCell row={row} col={col} tile={tile} puzzle={puzzle} rowStatus={rowStatus[row]} colStatus={colStatus[col]} />
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }
}

function * getWallStatus(current: number[], expected: number[]) {
    for (let i = 0; i < current.length; i++) {
        if (current[i] < expected[i]) {
            yield 'too-few-walls';
        }
        else if (current[i] > expected[i]) {
            yield 'too-many-walls';
        }
        else {
            yield 'correct-walls';
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
export class PuzzleCell extends Component<CellProps> {
    toggle(event: MouseEvent) {
        this.props.puzzle.setTile(this.props.row, this.props.col, this.props.tile.nextTile());
        event.preventDefault();
    }

    render(props: CellProps) {
        return (
            <td className={`puzzle-cell puzzle-cell-${props.tile.type.name} ${props.rowStatus} ${props.colStatus} ${props.tile.reserved ? 'marked-floor' : ''}`}
                data-row={this.props.row}
                data-col={this.props.col}
                // onClick={this.toggle.bind(this)}
            >
                {TileString.toHTML(props.tile)}
            </td>
        )
    }
}
