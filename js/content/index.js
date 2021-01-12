window.addEventListener('load', () => {
    operationLauncher.pushOperations(storage.getCurrentSiteOperation());
    operationLauncher.launchOperations();
})

const operationLauncher = (() => {
    const pressedKeys = {};
    const operationQueue = [];

    const pushOperations = operations => operationQueue.push(operations);

    const launchOperations = () => {
        operationQueue.sort((a, b) => a.priority - b.priority);
        while (hasNext()) {
            let operation = operationQueue.pop();
            launches[operation.launch.type](operation);
        }
    }

    const hasNext = () => !operationQueue.length;
    const isEveryKeyPressed = operation => operation.launch.keys.every(ac => pressedKeys[ac]);
    const isActiveTextElement = () => ["input", "textarea"].some(type => type === document.activeElement.localName);

    const launchActions = (operation, iteration = 0) => {
        if (!operation.actions[iteration]) return;

        const action = operation.actions[iteration];
        actionFunctions[action.type].init(action);

        launchActions(operation, iteration);
    }

    const launches = {
        keydown: (operation) => {
            window.addEventListener("keyup", (_event) => {
                if (_event.key) pressedKeys[_event.key.toLowerCase()] = false;
            })
            window.addEventListener("keydown", (_event) => {
                if (_event.key) pressedKeys[_event.key.toLowerCase()] = true;

                if (isEveryKeyPressed(operation) && !isActiveTextElement()) {
                    launchActions(operation);
                }
            })
        },
        onLoaded: (operation) => {
            launchActions(operation);
        }
    };

    return {
        pushOperations,
        launchOperations,
    };

})();
