export type TileClassType = (new () => Tile);

/**
 * @class Tile - Hierarchical representation of tile types.
 * Use Tile.parse(glyph) to construct a Tile with an arbitrary glyph.
 * Class hierarchy:
 * Tile
 *   Wall
 *   WalkableTile
 *     Floor
 *       MarkedFloor
 *       Room
 *       Hall
 *     Monster
 *       BossMonster
 *     Treasure
 */
export abstract class Tile {
    ASCII = "_"; // should be encodable as a URI with no escape
    emoji = "🌫"; // should be square
	glyph?: string;
    HTML?: string;
	solvable = true;
    static pattern = /.|[\?_-]/;

    setGlyph(glyph: string) {
        if (glyph) {
			if (glyph != this.ASCII) {
				this.glyph = glyph;
			}
			if (glyph.match(/\p{Emoji}/u)) {
				this.emoji = glyph;
			}
            if (!glyph.match(/\P{ASCII}/u)) {
                this.ASCII = glyph;
            }
        }
    }

    static parse(glyph: string): Tile {
        let tileType = Monster;
        for (tileType of [Floor, Wall, Treasure, BossMonster, MarkedFloor, Monster]) {
            if (glyph.match(tileType.pattern)) {
                break;
            }
        }
        const tile = new tileType();
        tile.setGlyph(glyph);
        return tile;
    }

    toHTML() {
        const glyph = this.HTML || this.glyph || this.emoji;
        const supported = document.fonts.check(`${css(document.body, "font-size")} ${css(document.body, "font-family")}`, glyph);
        if (supported) {
            return glyph;
        }
        else {
            return this.ASCII;
        }
    }

    static Wall: TileClassType;
    static WalkableTile: TileClassType;
    static Floor: TileClassType;
    static RoomFloor: TileClassType;
    static HallFloor: TileClassType;
    static Monster: TileClassType;
    static BossMonster: TileClassType;
    static Treasure: TileClassType;
}

function css(element: HTMLElement, property:string): string {
    return window.getComputedStyle(element, null).getPropertyValue(property);
}

export class Wall extends Tile {
    ASCII = "*";
    emoji = "🟫";
    static pattern = /[*#O◯◌⭕️🪨🟥🟧🟨🟩🟦🟪🟫]/iu;
}

export abstract class WalkableTile extends Tile { }

export class Floor extends WalkableTile {
    ASCII = ".";
    emoji = "⬜️";
    static pattern = /\p{White_Space}|[\.·🔳🔲⬛️⬜️▪️▫️◾️◽️◼️◻️]/iu;
}

export class MarkedFloor extends Floor {
    ASCII = "x";
    emoji = "🔳";
    HTML = "×";
    static pattern = /[xX×✖️╳⨯⨉❌⊘🚫💠❖]/iu;
}

export class RoomFloor extends Floor { }
export class HallFloor extends Floor { }

export class Treasure extends WalkableTile {
    ASCII = "T";
    emoji = "💎";
    static pattern = /[t💎👑💍🏆🥇🥈🥉🏅🎖🔮🎁📦🔑🗝]/iu;
	solvable = false;
}

export class Monster extends WalkableTile {
    ASCII = "m";
    emoji = "🦁";
    static pattern = /[a-su-wyz☺︎☹☻♜♝♞♟♖♗♘♙☃️⛄️🐶🐱🐭🐹🐰🦊🐻🐼🐻‍❄️🐨🐯🦁🐮🐷🐽🐸🐵🙈🙉🙊🐒🐔🐧🐦🐤🐣🐥🦆🦅🦉🦇🐺🐗🐴🦄🐝🪱🐛🦋🐌🐞🐜🪰🪲🪳🦟🦗🕷🕸🦂🐢🐍🦎🐙🦑🦐🦞🦀🐡🐠🐟🐬🐳🐋🦈🦭🐅🐆🦓🦍🦧🦣🐘🦛🦏🐪🐫🦒🦘🦬🐃🐂🐄🐎🐖🐏🐑🦙🐐🦌🐕🐩🦮🐕‍🦺🐈🐈‍⬛🐓🦃🦤🦚🦜🦢🦩🕊🐇🦝🦨🦡🦫🦦🦥🐁🐀🐿🦔🦠😈👿👹👺🤡👻💀☠️👽👾🤖🎃🧛🧟🧞🧜🧚🗿🛸]/u;
	solvable = false;
}

export class BossMonster extends Monster {
    ASCII = "M";
    emoji = "🐲";
    static pattern = /[A-SU-WYZ@♚♛♔♕🦖🦕🐊🐉🐲🧊]/u;
	solvable = false;
}

export const TileTypes = { Wall, WalkableTile, Floor, MarkedFloor, RoomFloor, HallFloor, Treasure, Monster, BossMonster };

Object.assign(Tile, TileTypes);

export default Tile;
