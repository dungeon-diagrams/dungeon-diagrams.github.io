import { h, Component } from "preact";
import { Puzzle, Tile } from "./puzzle-model.js";

export class PuzzleGrid extends Component<{puzzle: Puzzle}, {puzzle: Puzzle}> {
    constructor(props: {puzzle: Puzzle}) {
        super();
        this.state = { puzzle: props.puzzle };
    }

    puzzleChanged = (puzzle: Puzzle)=>{
        this.setState({puzzle: puzzle});
    }

    componentDidMount() {
        this.state.puzzle.addObserver(this.puzzleChanged);
    }

    componentWillUnmount() {
        this.state.puzzle.removeObserver(this.puzzleChanged);
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
        this.swipeTile = null;
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

    touchEnd = (event: TouchEvent) => {
        if (event.touches.length === 0) {
            setTimeout(()=>{
                this.swipeEnd(event);
            }, 100);
        }
    }

    render() {
        const puzzle = this.state.puzzle;
        const {rowCounts, colCounts} = puzzle.countWalls();
        const rowStatus = [...getWallStatus(rowCounts, puzzle.rowTargets)];
        const colStatus = [...getWallStatus(colCounts, puzzle.colTargets)];
        const isSolved = puzzle.isSolved();
        return (
            <div className={`puzzle-view ${isSolved?'solved':'unsolved'}`}
                onMouseDown={this.mouseDown}
                onMouseMove={this.mouseMove}
                onMouseUp={this.swipeEnd}
                onTouchStart={this.touchStart}
                onTouchMove={this.touchMove}
                onTouchEnd={this.touchEnd}
                onTouchCancel={this.swipeEnd}
            >
                <h2>
                    <span className='solved-marker'> ⭐️ </span>
                    <a href={'?puzzle=' + encodeURIComponent(puzzle.toURI())}>{puzzle.name}</a>
                    <span className='solved-marker'> ⭐️ </span>
                </h2>
                <table className="puzzle-grid">
                    <tbody>
                        <th />
                        {puzzle.colTargets.map((count, col) => (
                            <th className={`puzzle-wall-target ${colStatus[col]}`} data-col={col}>
                                {count}
                            </th>
                        ))}
                        {puzzle.tiles.map((rowTiles, row)=>(
                            <tr>
                                <th className={`puzzle-wall-target ${rowStatus[row]}`} data-row={row}>
                                    {puzzle.rowTargets[row]}
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
 * clicking (touching) a cell begins a drag with the opposite tile type.
 * each cell touched with that drag converts to the drag's tile type if possible.
 */
export class PuzzleCell extends Component<CellProps> {
    toggle(event: MouseEvent) {
        this.props.puzzle.setTile(this.props.row, this.props.col, this.props.tile.nextTile());
        event.preventDefault();
    }

    render(props: CellProps) {
        return (
            <td className={`puzzle-cell puzzle-cell-${props.tile.toName()} ${props.rowStatus} ${props.colStatus} ${props.tile.display === 'x' ? 'marked-floor' : ''}`}
                data-row={this.props.row}
                data-col={this.props.col}
                // onClick={this.toggle.bind(this)}
            >
                {props.tile.toEmoji()}
            </td>
        )
    }
}
