class Action {

    /**
     * @param {string} type
     */
    constructor(type) {
        this.type = type;
    }
}

class ClickAction extends Action {

    /**
     * @param {string} selector
     */
    constructor(selector) {
        super('Click');
        this.selector = selector;
    }
}

class DownloadAction extends Action {

    /**
     * @param {string} name
     * @param {string} extension
     * @param {string} selector
     */
    constructor(name, extension, selector) {
        super('Download image');
        this.selector = selector;
    }
}

class WaitAction extends Action {

    /**
     * @param {int} ms
     */
    constructor(ms) {
        super('Wait');
        this.ms = ms;
    }
}
