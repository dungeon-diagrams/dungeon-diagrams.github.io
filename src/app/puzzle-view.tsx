import { h, Component } from "preact";
import { PuzzleState, Tile, parsePuzzleSpec } from "./puzzle.js";

export class PuzzleGrid extends Component<PuzzleState> {
    render(props: PuzzleState) {
        return (
            <table class="puzzle-grid">
                <tbody>
                    {props.cells.map((row, y)=>(
                        <tr>
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
            <div>{props.tile.type}</div>
        )
    }
}
