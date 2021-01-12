class Launch {
    /**
     * @param {string} type
     */
    constructor(type) {
        this.type = type;
    }
}

class LaunchKeys extends Launch {
    /**
     * @param {string[]} keys
     */
    constructor(keys) {
        super('key');
        this.keys = keys;
    }
}
