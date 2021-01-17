window.addEventListener('load', async () => {
    const currentSiteOperations = await storage.getCurrentSiteOperation();
    operationLauncher.pushOperations(currentSiteOperations);
    operationLauncher.launchOperations();
})

const operationLauncher = (() => {
    const pressedKeys = {};
    const operationQueue = [];

    const pushOperations = operations => operationQueue.push(...operations);

    const launchOperations = () => {
        operationQueue.filter(operation => operation.isEnabled)
            .sort((a, b) => a.priority - b.priority);
        while (hasNext()) {
            let operation = operationQueue.pop();
            launches[operation.launch.type](operation);
        }
    }

    const hasNext = () => operationQueue.length;
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
            window.addEventListener("keyup", (_event) => {
                if (_event.key) pressedKeys[_event.key.toLowerCase()] = false;
            })
            window.addEventListener("keydown", (_event) => {
                if (_event.key) pressedKeys[_event.key.toLowerCase()] = true;

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
    };

})();
