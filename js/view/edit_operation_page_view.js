window.addEventListener('load', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const operationId = urlParams.get('operation');
    const {id, title, priority, actions, launch, regExes} = await storage.getOperationById(operationId);
    const {elements, addActionCard, createOperation} = await OperationView(launch.keys || [], regExes);


    const fillValue = (element, value) => element.value = value;

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
        reload: () => {
        },
    };


    const tabElement = elements.tabs.querySelector('#newOperation');
    tabElement.innerHTML = 'Edit operation';
    tabElement.disabled = true;

    elements.createOperationButton.innerHTML = `Edit operation <svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path fill="currentColor"
          d="M290.74 93.24l128.02 128.02-277.99 277.99-114.14 12.6C11.35 513.54-1.56 500.62.14 485.34l12.7-114.22 277.9-277.88zm207.2-19.06l-60.11-60.11c-18.75-18.75-49.16-18.75-67.91 0l-56.55 56.55 128.02 128.02 56.55-56.55c18.75-18.76 18.75-49.16 0-67.91z"></path>
</svg>
`;

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
