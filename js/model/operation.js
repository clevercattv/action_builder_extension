class Operation {
    /**
     * todo ADD link on site icon (get if no icon, before operations)
     *  and default icon (if operations uses for multiple sites or operation never launch)
     *  Also add refresh icon button somewhere... maybe...
     * @param {string} title
     * @param {Launch} launch
     * @param {string[]} regExes
     * @param {Action[]} actions
     * @param {int} priority
     * @param {boolean} isEnabled
     */
    constructor(title, launch, regExes, actions, priority, isEnabled) {
        this.id = generateID();
        this.title = title;
        this.launch = launch;
        this.regExes = regExes;
        this.actions = actions;
        this.priority = priority;
        this.isEnabled = isEnabled;
        this.icon = '';
    }

}

function generateID() {
    return 'xxxxxxxx'.replace(/[x]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
