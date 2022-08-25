/**
 * @class Tile
 * Hierarchical representation of tile types.
 * Use Tile.parse(glyph) to construct a Tile with an arbitrary glyph.
 * Class hierarchy:
 * Tile
 *   Wall
 *   WalkableTile
 *     Floor
 *       MarkedFloor
 *       RoomFloor (not implemented)
 *     FixedTile
 *       Monster
 *         BossMonster
 *       Treasure
 */
export abstract class Tile {
    ASCII: string = '_'; // should be encodable as a URI with no escape
    emoji: string = '🌫'; // should be square
    HTML?: string;
    static pattern: RegExp = /.|[\?_-]/;

    setGlyph(glyph: string) {
        if (glyph) {
            if (glyph.match(/\p{ASCII}/u)) {
                this.ASCII = glyph;
            }
            else {
                this.emoji = glyph;
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
        const glyph = this.HTML || this.emoji;
        const supported = document.fonts.check(`${css(document.body, 'font-size')} ${css(document.body, 'font-family')}`, glyph);
        if (supported) {
            return glyph;
        }
        else {
            return this.ASCII;
        }
    }

    static WalkableTile: (new () => Tile);
    static FixedTile: (new () => Tile);
    static Wall: (new () => Tile);
    static Floor: (new () => Tile);
    static Monster: (new () => Tile);
    static BossMonster: (new () => Tile);
    static Treasure: (new () => Tile);
}

function css(element: HTMLElement, property:string): string {
    return window.getComputedStyle(element, null).getPropertyValue(property);
}

export abstract class WalkableTile extends Tile { }
export abstract class FixedTile extends WalkableTile { }

export class Floor extends WalkableTile {
    ASCII = '.';
    emoji = '⬜️';
    static pattern = /\p{White_Space}|[\.·🔳🔲⬛️⬜️▪️▫️◾️◽️◼️◻️]/iu;
}

export class MarkedFloor extends Floor {
    ASCII = 'x';
    emoji = '🔳';
    HTML = '×';
    static pattern = /[x✖️×✖️x╳⨯⨉❌⊘🚫💠❖]/iu;
}

export class Wall extends Tile {
    ASCII = '*';
    emoji = '🟫';
    static pattern = /[*#O◯◌⭕️🪨🟥🟧🟨🟩🟦🟪🟫]/iu;
}

export class Treasure extends FixedTile {
    ASCII = 'T';
    emoji = '💎';
    static pattern = /[t🏆🥇🥈🥉🏅🎖🔮🎁📦💎👑]/iu;
}

export class Monster extends FixedTile {
    ASCII = 'm';
    emoji = '🦁';
    static pattern = /[a-su-wyz☺︎☹☻♜♝♞♟♖♗♘♙☃️⛄️🐶🐱🐭🐹🐰🦊🐻🐼🐻‍❄️🐨🐯🦁🐮🐷🐽🐸🐵🙈🙉🙊🐒🐔🐧🐦🐤🐣🐥🦆🦅🦉🦇🐺🐗🐴🦄🐝🪱🐛🦋🐌🐞🐜🪰🪲🪳🦟🦗🕷🕸🦂🐢🐍🦎🐙🦑🦐🦞🦀🐡🐠🐟🐬🐳🐋🦈🦭🐅🐆🦓🦍🦧🦣🐘🦛🦏🐪🐫🦒🦘🦬🐃🐂🐄🐎🐖🐏🐑🦙🐐🦌🐕🐩🦮🐕‍🦺🐈🐈‍⬛🐓🦃🦤🦚🦜🦢🦩🕊🐇🦝🦨🦡🦫🦦🦥🐁🐀🐿🦔🦠😈👿👹👺🤡👻💀☠️👽👾🤖🎃🧛🧟🧞🧜🧚🗿🛸]/u;
}

export class BossMonster extends Monster {
    ASCII = 'M';
    emoji = '🐲';
    static pattern = /[A-SU-WYZ♚♛♔♕🦖🦕🐊🐉🐲🧊]/u;
}

export const TileTypes = { Floor, MarkedFloor, Wall, Treasure, Monster, BossMonster, WalkableTile, FixedTile };

Object.assign(Tile, TileTypes);
