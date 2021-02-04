const actionsInfo = {
    click: {
        name: 'Click',
        type: 'click',
        file: 'html/action/click.html',
    },
    downloadImage: {
        name: 'Download image',
        type: 'downloadImage',
        file: 'html/action/download_image.html',
    },
    wait: {
        name: 'Wait',
        type: 'wait',
        file: 'html/action/wait.html',
    },
    reload: {
        name: 'Reload',
        type: 'reload',
        file: 'html/action/reload.html',
    },
};

class Action {

    /**
     * @param {string} type
     * @param {string} typeName
     */
    constructor(type, typeName) {
        this.id = generateID();
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
