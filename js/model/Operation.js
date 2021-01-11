class Operation {
    /**
     * @param {string} title
     * @param {Launch} launch
     * @param {string} regExes
     * @param {Action[]} actions
     * */
    constructor(title, launch, regExes, actions) {
        this.title = title;
        this.launch = launch;
        this.regExes = regExes;
        this.actions = actions;
    }

}
