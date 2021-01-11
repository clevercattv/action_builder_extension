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
     * @param {string} type
     */
    constructor(keys, type) {
        super(type);
        this.keys = keys;
    }
}
