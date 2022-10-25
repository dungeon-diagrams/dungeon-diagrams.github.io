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
