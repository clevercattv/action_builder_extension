const editOperationUi = (() => {

    const setUpdateOperationEvent = (operation, {elements, events, createOperationEvent}) => events.createOperationButton = () =>
        elements.createOperationButton.addEventListener('click', () => {
            if (createOperationEvent()) {
                setTimeout(() => storage.removeOperation(operation)
                    .then(_ => {
                        window.location = `${location.protocol}//${location.hostname}/html/operations.html`;
                    }), 100);
            }
        })

    const fillValue = (element, value) => element.value = value;

    const fillTitle = ({title}, {elements}) => fillValue(elements.operationTitleInput, title);

    const fillPriority = ({priority}, {elements}) => fillValue(elements.operationPriorityInput, priority);

    const fillLaunch = ({launch}, {elements}) => {
        fillValue(elements.launchTypeSelect, launch.type);
        fillValue(elements.launchKeysInput, launch.keys ?
            launch.keys.reduce((oldKey, key) => `${oldKey} + ${key}`) : '');

        elements.launchKeysInput.disabled = elements.launchTypeSelect.value !== 'key';
    }

    return {
        setUpdateOperationEvent,
        fillTitle,
        fillPriority,
        fillLaunch,
    }
})();
