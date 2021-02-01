window.addEventListener('load', async () => {
    const currentSiteOperations = await storage.getCurrentSiteOperation();
    operationLauncher.pushOperations(currentSiteOperations);
    operationLauncher.launchOperations();
})

const operationLauncher = (() => {
    const pressedKeys = {};
    const operationQueue = [];

    window.addEventListener("keyup", (event) => {
        if (event.key) pressedKeys[event.key.toLowerCase()] = false;
    })
    window.addEventListener("keydown", (event) => {
        if (event.key) pressedKeys[event.key.toLowerCase()] = true;
    })

    const pushOperations = operations => operationQueue.push(...operations);

    const launchOperations = () => {
        const operations = operationQueue.filter(operation => operation.isEnabled)
            .sort((a, b) => a.priority - b.priority);
        operationQueue.splice(0, operationQueue.length);
        while (operations.length) {
            let operation = operations.pop();
            launches[operation.launch.type](operation);
        }
    }

    const isEveryKeyPressed = operation => operation.launch.keys.every(ac => pressedKeys[ac]);
    const isActiveTextElement = () => ["input", "textarea"].some(type => type === document.activeElement.localName);

    const launchOperationActions = (operation, iteration = 0) => {
        if (!operation.actions[iteration]) return;

        const action = operation.actions[iteration];
        actionFunctions[action.type].init(action);

        launchOperationActions(operation, ++iteration);
    }

    const launches = {
        key: (operation) => {
            window.addEventListener("keydown", () => {
                if (isEveryKeyPressed(operation) && !isActiveTextElement()) {
                    launchOperationActions(operation);
                    console.log('key', operation)
                }
            })
        },
        load: (operation) => {
            launchOperationActions(operation);
            console.log('load', operation);
        }
    };

    return {
        pushOperations,
        launchOperations,
        launchOperationActions
    };

})();
