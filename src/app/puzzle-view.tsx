import { h, Component } from "preact";
import { Puzzle, PuzzleState, Tile } from "./puzzle-model.js";

export class PuzzleGrid extends Component<PuzzleState> {
    render(puzzle: PuzzleState) {
        return (
            <div class="puzzle-view">
                <h2>{puzzle.name}</h2>
                <table class="puzzle-grid">
                    <tbody>
                        <th />
                        {puzzle.colCounts.map((col, x) => (
                            <th className='puzzle-count-col'>{col}</th>
                        ))}
                        {puzzle.tiles.map((row, y)=>(
                            <tr>
                                <th className='puzzle-count-row'>{puzzle.rowCounts[y]}</th>
                                {row.map((tile, x)=>(
                                    <PuzzleCell x={x} y={y} tile={tile} />
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
}

export class PuzzleCell extends Component<CellProps> {
    render(props: CellProps) {
        return (
            <td className={`puzzle-cell puzzle-cell-${props.tile.toName()}`}>{props.tile.toEmoji()}</td>
        )
    }
}
