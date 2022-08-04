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
        return (
            <div className="puzzle-view">
                <h2>{puzzle.name}</h2>
                <table className="puzzle-grid">
                    <tbody>
                        <th />
                        {puzzle.colCounts.map((col, x) => (
                            <th className='puzzle-count-col'>{col}</th>
                        ))}
                        {puzzle.tiles.map((row, y)=>(
                            <tr>
                                <th className='puzzle-count-row'>{puzzle.rowCounts[y]}</th>
                                {row.map((tile, x)=>(
                                    <PuzzleCell x={x} y={y} tile={tile} puzzle={puzzle} />
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }
}

interface CellProps {
    x: number;
    y: number;
    tile: Tile;
    puzzle: Puzzle;
}

/**
 * A PuzzleCell is a view of a single Tile.
 * clicking (touching) a cell begins a drag with the opposite tile type.
 * each cell touched with that drag converts to the drag's tile type if possible.
 */
export class PuzzleCell extends Component<CellProps> {
    mouseUp(event: MouseEvent) {
        this.props.puzzle.setTile(this.props.x, this.props.y, this.props.tile.type.opposite);
    }

    render(props: CellProps) {
        return (
            <td className={`puzzle-cell puzzle-cell-${props.tile.toName()}`}
                onMouseUp={this.mouseUp.bind(this)}
            >
                {props.tile.toEmoji()}
            </td>
        )
    }
}
