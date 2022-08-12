import '../app/main.js';

describe('Web Application', function(){
    it('should load in a browser', function(){
        if (typeof window === 'undefined') {
            this.skip();
        }
        const appEl = document.getElementById('app');
        if (!appEl) {
            throw new Error("App element was not present");
        }
    })
})
