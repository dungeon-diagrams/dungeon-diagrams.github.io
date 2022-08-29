import { h, Component } from "preact";
import { preferredColorScheme, preferredContrast, formValues } from "./html-utils.js";

/**
 * @class SettingsManager
 * A settings manager which makes defaults available to JS and CSS
 * 
 * usage:
 * import { settings } from 'settings.js';
 * monster.emoji = settings.get('default-monster-glyph');
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
            if (typeof localStorage === "undefined") {
                storage = {};
            }
            else {
                storage = localStorage;
            }
            let element;
            if (typeof document === "undefined") {
                element = {dataset:{}};
            }
            else {
                element = document.documentElement;
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
            <p><a href="https://github.com/dungeon-diagrams/dungeon-diagrams.github.io">Source Code</a></p>
            <p><a href="https://github.com/dungeon-diagrams/dungeon-diagrams.github.io/issues">Feedback</a></p>
        </ExpandableMenu>
    );
}

type childrenProps = any;

class ExpandableMenu extends Component<childrenProps, {open:boolean}> {
    constructor(props:childrenProps) {
        super(props);
        this.state = {
            open: false
        };
    }

    toggle = (event:Event) => {
        event.preventDefault();
        event.stopPropagation();
        this.setState({open: !this.state.open});
    };

    render(props:childrenProps, state:{open:boolean}) {
        const children = state.open ? props.children : null;
        // TODO: display it in a modal, with dim background also bound to toggle
        return (
            <div className={`menu-container ${state.open ? 'open' : 'closed'}`}>
                <span className="menu-button" onClick={this.toggle}>☰</span>
                {children}
            </div>
        );
    }
}

class ControlPanel extends Component {
    saveSettings = (event:Event) => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const values = formValues(form);
        for (const [name, value] of Object.entries(values)) {
            if (value === "default" || value === "") {
                appSettings.removeItem(name);
            }
            else {
                appSettings.setItem(name, value);
            }
        }
    };

    resetRecords = (event:Event) => {
        event.preventDefault();
        // TODO
    };

    render() {
        const values = appSettings.values();
        return (
            <div className="control-panel">
                <form onSubmit={this.saveSettings}>
                    <fieldset>
                        <legend>Settings</legend>
                        Color Scheme:<br />
                        <label><input type="radio" name="preferred-color-scheme" value="default" checked={!values["preferred-color-scheme"]} /> System setting ({preferredColorScheme() || "light"})</label><br />
                        <label><input type="radio" name="preferred-color-scheme" value="light" checked={values["preferred-color-scheme"] === "light"} /> Light</label><br />
                        <label><input type="radio" name="preferred-color-scheme" value="dark" checked={values["preferred-color-scheme"] === "dark"} /> Dark</label>
                        <br /><br />
                        Contrast:<br />
                        <label><input type="radio" name="preferred-contrast" value="default" checked={!values["preferred-contrast"]} /> System setting ({preferredContrast() || "less"})</label><br />
                        <label><input type="radio" name="preferred-contrast" value="less" checked={values["preferred-contrast"] === "less"} /> Less</label><br />
                        <label><input type="radio" name="preferred-contrast" value="more" checked={values["preferred-contrast"] === "more"} /> More</label>
                        <br /><br />
                        <label>Favorite Monster:<br />
                            <input type="text" name="default-monster-glyph" size={1} value={values["default-monster-glyph"] || "🦁"} />
                        </label>
                        <br /><br />
                        <button>Save</button>
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
