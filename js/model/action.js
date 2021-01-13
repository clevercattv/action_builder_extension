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
        super('click');
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
        super('downloadImage');
        this.name = name;
        this.extension = extension;
        this.selector = selector;
    }
}

class WaitAction extends Action {

    /**
     * @param {int} ms
     */
    constructor(ms) {
        super('wait');
        this.ms = ms;
    }
}
