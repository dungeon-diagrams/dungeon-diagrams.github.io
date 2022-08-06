import { h, Component } from "preact";
import { Puzzle, PuzzleState, Tile, TileType, WALL, FLOOR} from "./puzzle-model.js";

export class PuzzleGrid extends Component<{puzzle: Puzzle}, {puzzle: Puzzle}> {
    constructor(props: {puzzle: Puzzle}) {
        super();
        this.state = { puzzle: props.puzzle };
    }

    swipeTile: {type: TileType, display?: string} | null = null;

    puzzleChanged = (puzzle: Puzzle)=>{
        this.setState({puzzle: puzzle});
    }

    componentDidMount() {
        this.state.puzzle.addObserver(this.puzzleChanged);
    }

    componentWillUnmount() {
        this.state.puzzle.removeObserver(this.puzzleChanged);
    }

    startSwipe = (event: MouseEvent)=> {
        event.preventDefault();
        const targetEl = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
        if (targetEl?.classList.contains("puzzle-cell")) {
            const row = parseInt(targetEl.dataset.row || '');
            const col = parseInt(targetEl.dataset.col || '');
            if (this.state.puzzle.isInBounds(row, col)) {
                const tile = this.state.puzzle.tiles[row][col];
                this.swipeTile = getNextTile(tile);
                this.state.puzzle.setTile(row, col, this.swipeTile.type, this.swipeTile.display);
            }
        }
    }

    moveSwipe = (event: MouseEvent)=> {
        if (!this.swipeTile) { 
            return;
        }
        event.preventDefault();
        const targetEl = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
        if (targetEl?.classList.contains("puzzle-cell")) {
            const row = parseInt(targetEl.dataset.row || '');
            const col = parseInt(targetEl.dataset.col || '');
            if (this.state.puzzle.isInBounds(row, col)) {
                const tile = this.state.puzzle.tiles[row][col];
                this.state.puzzle.setTile(row, col, this.swipeTile.type, this.swipeTile.display);
            }
        }
    }

    endSwipe = (event: Event)=> {
        this.swipeTile = null;
    }

    render() {
        const puzzle = this.state.puzzle;
        const {rowCounts, colCounts} = puzzle.countWalls();
        const rowStatus = [...getWallStatus(rowCounts, puzzle.rowTargets)];
        const colStatus = [...getWallStatus(colCounts, puzzle.colTargets)];
        const isSolved = puzzle.isSolved();
        return (
            <div className={`puzzle-view ${isSolved?'solved':'unsolved'}`}
                onMouseDown={this.startSwipe}
                onMouseMove={this.moveSwipe}
                onMouseUp={this.endSwipe}
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
                            <th className={`puzzle-wall-target col-${col} ${colStatus[col]}`}>
                                {count}
                            </th>
                        ))}
                        {puzzle.tiles.map((rowTiles, row)=>(
                            <tr>
                                <th className={`puzzle-wall-target row-${row} ${rowStatus[row]}`}>
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
        const {type, display} = getNextTile(this.props.tile);
        this.props.puzzle.setTile(this.props.row, this.props.col, type, display);
        event.preventDefault();
    }

    render(props: CellProps) {
        return (
            <td className={`puzzle-cell puzzle-cell-${props.tile.toName()} ${props.rowStatus} ${props.colStatus} ${props.tile.display === 'x' ? 'marked-floor' : ''}`}
                data-row={this.props.row}
                data-col={this.props.col}
                onClick={this.toggle.bind(this)}
            >
                {props.tile.toEmoji()}
            </td>
        )
    }
}

function getNextTile(prevTile: Tile) {
    let newType;
    let newDisplay;
    if (prevTile.type === WALL) {
        newType = FLOOR;
        newDisplay = 'x';
    }
    else if (prevTile.type === FLOOR && prevTile.display === 'x') {
        newType = FLOOR;
        newDisplay = '.';
    }
    else {
        newType = WALL;
    }
    return {type: newType, display: newDisplay};
}
