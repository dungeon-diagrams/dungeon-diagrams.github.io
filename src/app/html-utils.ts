export function parseQuery(query: string): {[key:string]: any} {
    query = query.replace(/^#?\??|\/$/g,'');
    const items = query.split('&');
    const params: any = {};
    items.forEach(function(item){
        const parts = item.split('=');
        const key = decodeURIComponent(parts[0]);
        let value: string | string[] | number = decodeURIComponent(parts[1]);
        if (value.match(/^\d+$/)) {
            value = parseInt(value);
        }
        else if (value.match(/,/)) {
            value = value.split(/,/);
        }
        params[key] = value;
    });
    return params;
}

export function formValues(form: HTMLElement) {
    const values: {[key:string]: any} = {};
    const inputs = form.querySelectorAll('[name]');
    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i] as HTMLInputElement;
        if (input.type === 'checkbox') {
            values[input.name] = input.checked;
        }
        else if (input.type === 'radio') {
            if (input.checked) {
                values[input.name] = input.value;
            }
        }
        else if (input.type === 'number') {
            values[input.name] = parseInt(input.value);
        }
        else {
            values[input.name] = input.value;
        }
    }
    return values;
}

export function isTouchScreen() {
    return window.navigator.maxTouchPoints >= 1;
}

export function prefersColorScheme() {
    const storedVal = localStorage.getItem('prefers-color-scheme');
    if (storedVal) {
        return storedVal;
    }
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return 'dark';
    }
    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
        return 'light';
    }
    return 'light';
}

export function prefersContrast() {
    const storedVal = localStorage.getItem('prefers-contrast');
    if (storedVal) {
        return storedVal;
    }
    if (window.matchMedia("(prefers-contrast: more)").matches) {
        return 'more';
    }
    if (window.matchMedia("(prefers-contrast: less)").matches) {
        return 'less';
    }
    return null;
}
