window.addEventListener('load', async () => {
    document.body.appendChild(await fetchActionBody('html/new_operation.html'));

    const urlParams = new URLSearchParams(window.location.search);
    const operationId = urlParams.get('operation');
    const {id, title, priority, actions, launch, regExes} = await storage.getOperationById(operationId);

    const fillValue = (element, value) => element.value = value;

    const {elements, operationActions, addActionCard, createOperation} = OperationView(launch.keys || [], regExes);

    elements.createOperationButton.addEventListener('click', () => {
        const operation = createOperation();
        console.log(operation);
        return storage.addOperation(operation)
            .then(() => setTimeout(() => storage.removeOperationById(id)
                .then(() => window.location = `${location.protocol}//${location.hostname}/html/operations.html`), 100));
    });

    fillValue(elements.operationTitleInput, title);
    fillValue(elements.operationPriorityInput, priority);
    fillValue(elements.launchTypeSelect, launch.type);

    elements.launchKeysInput.disabled = elements.launchTypeSelect.value !== 'key';

    elements.actionsElement.innerHTML = '';
    for (const action of actions) {
        const operationAction = operationActions.filter(info => info.type === action.type).pop();
        const card = await ui_generator.action(operationAction);

        await addActionCard(elements.actionsElement, operationAction, card);
        operationAction.fillInputs(card, action);
    }
})
