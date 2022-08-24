export function parseQuery(query: string): {[key:string]: any} {
    query = query.replace(/^#?\??|\/$/g,'');
    const items = query.split('&');
    const params: any = {};
    items.forEach(function(item){
        const parts = item.split('=');
        const key = decodeURIComponent(parts[0]);
        let value: string | string[] | number = decodeURIComponent(parts[1]);
        if (value.match(/^-?\d+$/)) {
            value = parseInt(value);
        }
        else if (value.match(/,/)) {
            value = value.split(/,/);
        }
        params[key] = value;
    });
    return params;
}

export function formValues(form: HTMLElement): {[key:string]: any} {
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

export function css(element: HTMLElement, property:string): string {
    return window.getComputedStyle(element, null).getPropertyValue(property);
}

export function glyphSupported(glyph:string) {
    const supported = document.fonts.check(`${css(document.body, 'font-size')} ${css(document.body, 'font-family')}`, glyph);
}

export function isTouchScreen() {
    return window.navigator.maxTouchPoints >= 1;
}

export function preferredColorScheme() {
    for (const theme of ["dark", "light"]) {
        if (window.matchMedia(`(prefers-color-scheme: ${theme})`).matches) {
            return theme;
        }
    }
    return null;
}

export function preferredContrast() {
    for (const theme of ["more", "less"]) {
        if (window.matchMedia(`(prefers-contrast: ${theme})`).matches) {
            return theme;
        }
    }
    return null;
}
