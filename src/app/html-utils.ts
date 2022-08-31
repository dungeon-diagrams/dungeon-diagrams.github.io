export function parseQuery(query: string): {[key:string]: (string | number | string[])} {
    query = query.replace(/^#?\??|\/$/g,"");
    const items = query.split("&");
    const params: {[key:string]: (string | number | string[])} = {};
    items.forEach((item)=> {
        const parts = item.split("=");
        const key = decodeURIComponent(parts[0]);
        let value: string | string[] | number = decodeURIComponent(parts[1]);
        if (value.match(/^-?\d+$/)) {
            value = parseInt(value, 10);
        }
        else if (value.match(/,/)) {
            value = value.split(/,/);
        }
        params[key] = value;
    });
    return params;
}

export function formValues(form: HTMLElement): {[key:string]: (string | number | boolean)} {
    const values: {[key:string]: (string | number | boolean)} = {};
    const inputs = form.querySelectorAll("[name]");
    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i] as HTMLInputElement;
        if (input.type === "checkbox") {
            values[input.name] = input.checked;
        }
        else if (input.type === "radio") {
            if (input.checked) {
                values[input.name] = input.value;
            }
        }
        else if (input.type === "number") {
            values[input.name] = parseInt(input.value, 10);
        }
        else {
            values[input.name] = input.value;
        }
    }
    return values;
}

export function findParent(el: HTMLElement | null, selector: string) {
    while (el) {
        if (el.matches(selector)) {
            return el;
        }
        el = el.parentElement;
    }
    return null;
}

export function css(element: HTMLElement, property:string): string {
    return window.getComputedStyle(element, null).getPropertyValue(property);
}

export function glyphSupported(glyph:string) {
    try {
        return document.fonts.check(`${css(document.body, "font-size")} ${css(document.body, "font-family")}`, glyph);
    }
    catch (e) {
        return false;
    }
}

export function isTouchScreen() {
    return navigator.maxTouchPoints >= 1;
}

export function preferredColorScheme() {
    try {
        for (const theme of ["dark", "light"]) {
            if (window.matchMedia(`(prefers-color-scheme: ${theme})`).matches) {
                return theme;
            }
        }
    }
    catch (e) {  
    }
    return null;
}

export function preferredContrast() {
    try {
        for (const theme of ["more", "less"]) {
            if (window.matchMedia(`(prefers-contrast: ${theme})`).matches) {
                return theme;
            }
        }
    }
    catch (e) {
    }
    return null;
}
