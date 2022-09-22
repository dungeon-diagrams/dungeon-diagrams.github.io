import { default as runes } from "runes";
export type TileClassType = (new (glyph?:string) => Tile);

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
    static glyphs: Set<unknown>;
    static pattern: RegExp;
    ASCII?: string; // should be encodable as a URI with no escape
    emoji?: string; // should be square
	glyph?: string;
    HTML?: string;
    walkable?: boolean;
	solvable?: boolean;

    static {
        this.prototype.ASCII = "?";
        this.prototype.emoji = "🌫";
        this.prototype.walkable = true;
        this.prototype.solvable = true;
    }

    constructor(glyph?:string) {
        this.setGlyph(glyph);
    }

    setGlyph(glyph?: string) {
        if (glyph) {
			if (glyph != this.ASCII) {
				this.glyph = glyph;
                if (!glyph.match(/\P{ASCII}/u)) {
                    this.ASCII = glyph;
                }
            }
			if (glyph.match(/\p{Emoji}/u)) {
				this.emoji = glyph;
			}
        }
    }

    /**
     * @param {string} glyph
     * @returns instance of the matching subclass of Tile
     */
    static parse(glyph: string): Tile {
        let tileType:TileClassType = Monster;
        for (tileType of [Floor, MarkedFloor, Wall, Treasure, BossMonster, Monster]) {
            if (glyph.match(tileType as unknown as RegExp)) {
                break;
            }
        }
        const tile = new tileType(glyph);
        return tile;
    }

    /**
     * support for string.match(Tile)
     */
     static [Symbol.match](str:string): RegExpMatchArray | null {
        const glyph = runes(str)[0];
        if (this.glyphs?.has(glyph)) {
            return [glyph];
        }
        if (this.pattern?.test(glyph)) {
            return [glyph];
        }
        return null;
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
    static Floor: TileClassType;
    static RoomFloor: TileClassType;
    static HallFloor: TileClassType;
    static Monster: TileClassType;
    static BossMonster: TileClassType;
    static Treasure: TileClassType;
    static WalkableTile: TileClassType;
    static SolvableTile: TileClassType;
}

function css(element: HTMLElement, property:string): string {
    return window.getComputedStyle(element, null).getPropertyValue(property);
}

export class Wall extends Tile {
    static glyphs = new Set(runes("*#O◯◌⭕️🪨🟥🟧🟨🟩🟦🟪🟫"))
    static {
        this.prototype.ASCII = "*";
        this.prototype.emoji = "🟫";
        this.prototype.walkable = false;
    }
}

export abstract class WalkableTile extends Tile { }

export class Floor extends WalkableTile {
    static glyphs = new Set(runes(".·🔳🔲⬛️⬜️▪️▫️◾️◽️◼️◻️"));
    static pattern = /\p{White_Space}/iu;
    static {
        this.prototype.ASCII = ".";
        this.prototype.emoji = "⬜️";
    }
}

export class MarkedFloor extends Floor {
    static glyphs = new Set(runes("xX×✖️╳⨯⨉❌⊘🚫💠❖"));
    static pattern = /[x]/i;
    static {
        this.prototype.ASCII = "x";
        this.prototype.emoji = "🔳";
        this.prototype.HTML = "×";
    }
}

export class RoomFloor extends Floor { }
export class HallFloor extends Floor { }

export class Treasure extends WalkableTile {
    static glyphs = new Set(runes("tT💎👑💍🏆🥇🥈🥉🏅🎖🔮🎁📦🔑🗝"))
    static {
        this.prototype.ASCII = "T";
        this.prototype.emoji = "💎";
        this.prototype.solvable = false;
    }
}

export class Monster extends WalkableTile {
    static glyphs = new Set(runes("☺︎☹☻♜♝♞♟♖♗♘♙☃️⛄️🐶🐱🐭🐹🐰🦊🐻🐼🐻‍❄️🐨🐯🦁🐮🐷🐽🐸🐵🙈🙉🙊🐒🐔🐧🐦🐤🐣🐥🦆🦅🦉🦇🐺🐗🐴🦄🐝🪱🐛🦋🐌🐞🐜🪰🪲🪳🦟🦗🕷🕸🦂🐢🐍🦎🐙🦑🦐🦞🦀🐡🐠🐟🐬🐳🐋🦈🦭🐅🐆🦓🦍🦧🦣🐘🦛🦏🐪🐫🦒🦘🦬🐃🐂🐄🐎🐖🐏🐑🦙🐐🦌🐕🐩🦮🐕‍🦺🐈🐈‍⬛🐓🦃🦤🦚🦜🦢🦩🕊🐇🦝🦨🦡🦫🦦🦥🐁🐀🐿🦔🦠😈👿👹👺🤡👻💀☠️👽👾🤖🎃🧛🧟🧞🧜🧚🗿🛸"));
    static pattern = /[a-su-wyz]/u
    static {
        this.prototype.ASCII = "m";
        this.prototype.emoji = "🦁";
        this.prototype.solvable = false;
    }
}

export class BossMonster extends Monster {
    static glyphs = new Set(runes("@♚♛♔♕🦖🦕🐊🐉🐲🧊"));
    static pattern = /[A-SU-WYZ]/u;
    static {
        this.prototype.ASCII = "M";
        this.prototype.emoji = "🐲";
    }
}

/**
 * @class SolvableTile:
 * virtual class that implements (t instanceof SolvableTile)
 * by checking the `solvable` property
 */
 export class SolvableTile extends Tile {
    static [Symbol.hasInstance](instance:Tile) {
        return Boolean(instance.solvable);
    }
}

export const TileTypes = { Wall, Floor, MarkedFloor, RoomFloor, HallFloor, Treasure, Monster, BossMonster, WalkableTile, SolvableTile };

Object.assign(Tile, TileTypes);

export default Tile;
