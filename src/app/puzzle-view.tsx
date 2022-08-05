import { h, Component } from "preact";
import { Puzzle, PuzzleState, Tile} from "./puzzle-model.js";

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

    render() {
        const puzzle = this.state.puzzle;
        const {rowCounts, colCounts} = puzzle.countWalls();
        const rowStatus = [...getWallStatus(rowCounts, puzzle.rowTargets)];
        const colStatus = [...getWallStatus(colCounts, puzzle.colTargets)];
        return (
            <div className="puzzle-view">
                <h2><a href={'?puzzle=' + encodeURIComponent(puzzle.toURI())}>{puzzle.name}</a></h2>
                <table className="puzzle-grid">
                    <tbody>
                        <th />
                        {puzzle.colTargets.map((count, col) => (
                            <th className={`puzzle-count col-${col} ${colStatus[col]}`}>
                                {count}
                            </th>
                        ))}
                        {puzzle.tiles.map((rowTiles, row)=>(
                            <tr>
                                <th className={`puzzle-count row-${row} ${rowStatus[row]}`}>
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
        this.props.puzzle.setTile(this.props.row, this.props.col, this.props.tile.type.opposite);
        event.preventDefault();
    }

    render(props: CellProps) {
        return (
            <td className={`puzzle-cell puzzle-cell-${props.tile.toName()} ${props.rowStatus} ${props.colStatus}`}
                onClick={this.toggle.bind(this)}
            >
                {props.tile.toEmoji()}
            </td>
        )
    }
}
