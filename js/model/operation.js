class Operation {
    /**
     * todo add disable option
     * @param {string} title
     * @param {Launch} launch
     * @param {string[]} regExes
     * @param {Action[]} actions
     * @param {int} priority
     */
    constructor(title, launch, regExes, actions, priority) {
        this.id = generateID();
        this.title = title;
        this.launch = launch;
        this.regExes = regExes;
        this.actions = actions;
        this.priority = priority;
    }

}

function generateID() {
    return 'xxxxxxxx'.replace(/[x]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
