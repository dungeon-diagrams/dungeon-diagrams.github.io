import { h, Component } from "preact";
import { PuzzleState, Tile } from "./puzzle-model.js";

export class PuzzleGrid extends Component<PuzzleState> {
    render(props: PuzzleState) {
        return (
            <table class="puzzle-grid">
                <tbody>
                    <th />
                    {props.colCounts.map((col, x) => (
                        <th className='puzzle-count-col'>{col}</th>
                    ))}
                    {props.tiles.map((row, y)=>(
                        <tr>
                            <th className='puzzle-count-row'>{props.rowCounts[y]}</th>
                            {row.map((tile, x)=>(
                                <PuzzleCell x={x} y={y} tile={tile} />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
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
