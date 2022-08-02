import { h, Component } from "preact";
import { PuzzleState, Tile, TileType } from "./puzzle-model.js";

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

function getTileEmoji(tileType: TileType) {
    switch(tileType) {
        case TileType.FLOOR:
            return '⬜️';
        case TileType.WALL:
            return  '🟫';
        case TileType.TREASURE:
            return '🏆';
        case TileType.MONSTER:
            return '🐊';
    }
}

export class PuzzleCell extends Component<CellProps> {
    render(props: CellProps) {
        return (
            <td className={`puzzle-cell puzzle-cell-${props.tile.type}`}>{getTileEmoji(props.tile.type)}</td>
        )
    }
}
