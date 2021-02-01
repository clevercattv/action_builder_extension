window.addEventListener('load', async () => {
    document.body.appendChild(await fetchFirstBodyElement('html/new_operation.html'));

    const urlParams = new URLSearchParams(window.location.search);
    const operationId = urlParams.get('operation');
    const {id, title, priority, actions, launch, regExes} = await storage.getOperationById(operationId);

    const fillValue = (element, value) => element.value = value;

    const {elements, addActionCard, createOperation} = OperationView(launch.keys || [], regExes);
    const actionFillFunctions = {
        click: (container, {selector}) => {
            container.querySelector('#selector').value = selector;
        },
        downloadImage: (container, {extension, name, selector}) => {
            container.querySelector('#name').value = name;
            container.querySelector('#extension').value = extension;
            container.querySelector('#selector').value = selector;
        },
        wait: (container, {ms}) => {
            container.querySelector('#ms').value = ms;
        },
        reload: () => {},
    };

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
        const fillFunction = actionFillFunctions[action.type];
        const card = await addActionCard(actionsInfo[action.type]);
        fillFunction(card, action);
    }
})
