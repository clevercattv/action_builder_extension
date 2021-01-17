class Action {

    /**
     * @param {string} type
     * @param {string} typeName
     */
    constructor(type, typeName) {
        this.type = type;
        this.typeName = typeName;
    }
}

class ClickAction extends Action {

    /**
     * @param {string} selector
     */
    constructor(selector) {
        super('click', 'Click');
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
        super('downloadImage', 'Download image');
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
        super('wait', 'Wait');
        this.ms = ms;
    }
}
