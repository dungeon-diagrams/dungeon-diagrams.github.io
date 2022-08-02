import { h, Component } from "preact";
import { PuzzleState, Tile, parsePuzzleSpec } from "./puzzle-model.js";

export class PuzzleGrid extends Component<PuzzleState> {
    render(props: PuzzleState) {
        return (
            <table class="puzzle-grid">
                <tbody>
                    <th />
                    {props.cells[0].map((col, x) => (
                        <th>{String.fromCharCode("A".charCodeAt(0) + x)}</th>
                    ))}
                    {props.cells.map((row, y)=>(
                        <tr>
                            <th>{y+1}</th>
                            {row.map((tile, x)=>(
                                <td><PuzzleCell x={x} y={y} tile={tile}/></td>
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
            <div class="puzzle-cell">{props.tile.type}</div>
        )
    }
}

