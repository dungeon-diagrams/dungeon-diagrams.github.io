import { h, Component } from 'preact';
import { preferredContrast, preferredColorScheme, formValues } from './html-utils.js';

export function SettingsButton() {
    return (
        <MenuButton>
            <ControlPanel />
        </MenuButton>
    )
}

class MenuButton extends Component<any, {open:boolean}> {
    constructor(props:any) {
        super(props);
        this.state = {
            open: false
        };
    }

    toggle = (event:Event) => {
        event.preventDefault();
        event.stopPropagation();
        this.setState({open: !this.state.open});
    }

    render(props:any, state:{open:boolean}) {
        const children = state.open ? props.children : null;
        // TODO: display it in a modal, with dim background also bound to toggle
        return (
            <div style={{position:'fixed', top:'1em', left:'1em', textAlign:'left'}}>
                <span style={{cursor:'poiner'}} onClick={this.toggle}>☰</span>
                {children}
            </div>
        )
    }
}

class ControlPanel extends Component {
    saveSettings = (event:Event) => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const values = formValues(form);
        for (const [name, value] of Object.entries(values)) {
            if (value === 'default') {
                localStorage.removeItem(name);
            }
            else {
                localStorage.setItem(name, value);
            }
        }
    }

    resetRecords = (event:Event) => {
        event.preventDefault();
        // TODO
    }

    render() {
        const values = {...localStorage};
        return (
            <div className="control-panel" style={{"text-align": "left"}}>
                <form onSubmit={this.saveSettings}>
                    <fieldset>
                        <legend>Settings</legend>
                        Color scheme:<br/>
                        <label><input type="radio" name="preferred-color-scheme" value="default" checked={!values['preferred-color-scheme']} />Default</label><br/>
                        <label><input type="radio" name="preferred-color-scheme" value="light" checked={values['preferred-color-scheme'] === 'light'} />Light</label><br/>
                        <label><input type="radio" name="preferred-color-scheme" value="dark" checked={values['preferred-color-scheme'] === 'dark'} />Dark</label>
                        <br/><br/>
                        Contrast:<br/>
                        <label><input type="radio" name="preferred-contrast" value="default" checked={!values['preferred-contrast']} />Default</label><br/>
                        <label><input type="radio" name="preferred-contrast" value="less" checked={values['preferred-contrast'] === 'less'} />Less</label><br/>
                        <label><input type="radio" name="preferred-contrast" value="more" checked={values['preferred-contrast'] === 'more'} />More</label>
                        <br/><br/>
                        <button>Save</button>
                    </fieldset>
                </form>
                <form onSubmit={this.resetRecords}>
                    <fieldset>
                        <legend>Records</legend>
                        wins: 99
                        <br/>
                        average time: 01:23
                        <br/>
                        streak: 7 days
                        <br/>
                        <button>Reset Records</button>
                    </fieldset>
                </form>
            </div>
        )
    }
}
