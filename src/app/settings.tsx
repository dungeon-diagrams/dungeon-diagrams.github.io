import { h, Component } from "preact";
import { default as runes } from "runes";
import { preferredColorScheme, preferredContrast } from "./html-utils.js";
import { Tile, Monster } from "./tile.js";

/**
 * @class SettingsManager
 * A settings manager which makes defaults available to JS and CSS
 * 
 * usage:
 * import { settings } from "settings.js";
 * monster.emoji = settings.get("default-monster-glyph");
 */
class SettingsManager {
    storage: Storage;
    element: HTMLElement;

    constructor(storage?: Storage, doc?: HTMLElement) {
        this.storage = storage || localStorage;
        this.element = doc || document.documentElement;
        // expose current values to DOM
        for (const [key, value] of Object.entries(this.storage)) {
            if (typeof value !== "object") {
                this.element.dataset[this.fixKey(key)] = value;
            }
        }
    }

    values() {
        return {...this.storage};
    }

    getItem(key: string): unknown {
        return this.storage.getItem(key);
    }

    removeItem(key: string): void {
        delete this.element.dataset[this.fixKey(key)];
        return this.storage.removeItem(key);
    }

    setItem(key: string, value?: string | number | boolean | object ): void {
        if (typeof value !== "object") {
            this.element.dataset[this.fixKey(key)] = value as string;
        }
        return this.storage.setItem(key, value as string);
    }

    fixKey(key: string) {
        return key.replace(/-./g, match => match[1].toUpperCase());
    }

    static singleton?: SettingsManager;

    static getSingleton() {
        if (!SettingsManager.singleton) {
            let storage;
            try {
                storage = localStorage;
            }
            catch (e) {
                try {
                    storage = sessionStorage;
                }
                catch (e) {
                    storage = {
                        getItem: (key:string)=>{return null}
                    }
                }
            }
            let element;
            try {
                element = document.documentElement;
            }
            catch (e) {
                element = {dataset:{}};
            }
            SettingsManager.singleton = new SettingsManager(storage as Storage, element as HTMLElement);
        }
        return SettingsManager.singleton;
    }
}

/** singleton to access settings methods */

export const appSettings = SettingsManager.getSingleton();

/* --- UI Components --- */

export function SettingsButton() {
    return (
        <ExpandableMenu>
            <ControlPanel />
            <br />
            <p><a target="_blank" href="https://github.com/dungeon-diagrams/dungeon-diagrams.github.io">Source Code</a></p>
            <p><a target="_blank" href="https://github.com/dungeon-diagrams/dungeon-diagrams.github.io/issues">Feedback</a></p>
        </ExpandableMenu>
    );
}

type childrenProps = any;

/**
 * @class ExpandableMenu -
 * state machine that supports css transitions with the following phases:
 * .menu-container.closed
 * .menu-container.open.transitioning
 * .menu-container.open
 * .menu-container.closed.transitioning
 */

class ExpandableMenu extends Component<childrenProps, {open:boolean, transitioning:boolean}> {
    constructor(props:childrenProps) {
        super(props);
        this.state = {
            open: false,
            transitioning: false
        };
    }

    toggle = (event:Event) => {
        event.preventDefault();
        event.stopPropagation();
        this.setState({
            open: !this.state.open,
            transitioning: true
        });
    };

    transitionEnd = (event:Event) => {
        if ((event.target as HTMLElement).classList.contains("menu-screen")) {
            this.setState({transitioning: false});
        }
    };

    render(props:childrenProps, state:{open:boolean, transitioning:boolean}) {
        return (
            <div className={`menu-container ${state.open ? "open" : "closed"} ${state.transitioning ? "transitioning" : ""}`}>
                <span className="menu-button" onClick={this.toggle}>{!state.open || state.transitioning ? "☰" : "✖️" }</span>
                <div className="menu-screen" onClick={state.open ? this.toggle : undefined } onTransitionEnd={this.transitionEnd}>
                    <div className="menu-contents" onClick={(event)=>{event.stopPropagation()}}>
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}

class ControlPanel extends Component {
    saveSettings = (event:Event) => {
        event.preventDefault();
        const formElement = (event.target as HTMLElement).closest('form') as HTMLFormElement;
        const formData = new FormData(formElement);
        for (const [name, value] of formData.entries()) {
            if (value === "default" || value === "") {
                appSettings.removeItem(name);
            }
            else if (name === "default-monster-glyph") {
                const glyphs = runes(value as string);
                const glyph = glyphs[glyphs.length-1];
                const tile = Tile.parse(glyph);
                if (tile instanceof Monster) {
                    appSettings.setItem(name, tile.toHTML());
                }
                else {
                    appSettings.removeItem(name);
                }
            }
            else {
                appSettings.setItem(name, value);
            }
        }
        this.setState({});
    };

    resetRecords = (event:Event) => {
        event.preventDefault();
        // TODO
    };

    render() {
        const values = appSettings.values();
        return (
            <div className="control-panel">
                <form onChange={this.saveSettings} onKeyUp={this.saveSettings} onSubmit={this.saveSettings}>
                    <fieldset>
                        <legend>Settings</legend>
                        <div>
                            Color Scheme:<br />
                            <label><input type="radio" name="preferred-color-scheme" value="default" checked={!values["preferred-color-scheme"]} /> System setting ({preferredColorScheme() || "light"})</label><br />
                            <label><input type="radio" name="preferred-color-scheme" value="light" checked={values["preferred-color-scheme"] === "light"} /> Light</label><br />
                            <label><input type="radio" name="preferred-color-scheme" value="dark" checked={values["preferred-color-scheme"] === "dark"} /> Dark</label>
                        </div>
                        <div>
                            Contrast:<br />
                            <label><input type="radio" name="preferred-contrast" value="default" checked={!values["preferred-contrast"]} /> System setting ({preferredContrast() || "less"})</label><br />
                            <label><input type="radio" name="preferred-contrast" value="less" checked={values["preferred-contrast"] === "less"} /> Less</label><br />
                            <label><input type="radio" name="preferred-contrast" value="more" checked={values["preferred-contrast"] === "more"} /> More</label>
                        </div>
                        <div>
                            <label>Favorite Monster:<br />
                                <input type="text" name="default-monster-glyph" size={1} value={values["default-monster-glyph"] || "🦁"} />
                            </label>
                        </div>
                        <div>
                            Game Timezone:<br />
                            <label><input type="radio" name="game-timezone" value="UTC" checked={!values["game-timezone"] || values["game-timezone"] === "UTC"} /> UTC</label><br />
                            <label>
                                <input type="radio" name="game-timezone" value="local" checked={values["game-timezone"] === "local"} /> Local Timezone
                                {/* <br/><input type="radio" style={{visibility:"hidden"}} /> ({Intl.DateTimeFormat().resolvedOptions().timeZone}) */}
                            </label>
                        </div>
                        <div>
                            Game Clock:<br />
                            <label><input type="radio" name="game-clock" value="server" checked={!values["game-clock"] || values["game-clock"] === "server"} /> Server Clock</label><br />
                            <label><input type="radio" name="game-clock" value="browser" checked={values["game-clock"] === "browser"} /> Browser Clock</label>
                        </div>
                    </fieldset>
                </form>
                <form onSubmit={this.resetRecords} style={{display:"none"}}>
                    <fieldset>
                        <legend>Records</legend>
                        <div>🚧 🚜 🚧</div>
                        wins: 99
                        <br />
                        average time: 01:23
                        <br />
                        streak: 7 days
                        <br />
                        <button>Reset Records</button>
                    </fieldset>
                </form>
            </div>
        );
    }
}
