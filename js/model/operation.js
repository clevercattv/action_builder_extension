class Operation {
    /**
     * @param {string} title
     * @param {Launch} launch
     * @param {string[]} regExes
     * @param {Action[]} actions
     * @param {int} priority
     */
    constructor(title, launch, regExes, actions, priority) {
        this.title = title;
        this.launch = launch;
        this.regExes = regExes;
        this.actions = actions;
        this.priority = priority;
    }

}
