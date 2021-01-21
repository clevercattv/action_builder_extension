window.addEventListener('load', async () => {
    // enable bootstrap tooltips
    $(function () {
        $('[data-toggle="tooltip"]').tooltip({
            delay: {
                show: 500,
                hide: 200
            }
        });
    });

    const container = document.querySelector('[class*=container]');
    const operations = await storage.getOperations();
    const currentLocation = await new Promise(resolve => chrome.tabs.query(
        {active: true}, tab => resolve(tab[0].url)
    ));
    const groupedOperations = operations.reduce((previousValue, currentValue) => {
        if (currentValue.regExes.some(regEx => currentLocation.match(regEx))) {
            previousValue.currentPageOperations.push(currentValue);
        } else {
            previousValue.otherPagesOperations.push(currentValue);
        }
        return previousValue;
    }, {
        currentPageOperations: [],
        otherPagesOperations: [],
    });

    const buildOperation = async operation => {
        const operationElement = await fetchFirstBodyElement('html/popup/popup_operation.html');
        operationElement.querySelector('#title').innerText = operation.title;

        operationElement.querySelector('#launch').innerText = 'Launch type: ' + operation.launch.type
            + (operation.launch.keys ? ` [${operation.launch.keys.reduce((prev, cur) => `${prev} + ${cur}`)}]` : '');

        operationElement.querySelector('#actionTitle').innerText = `Actions [${operation.actions.length}]`;

        operationElement.querySelector('#edit')
            .addEventListener('click', () => chrome.tabs.create({
                url: `${location.protocol}//${location.hostname}/html/edit_operation.html?operation=${operation.id}`
            }));

        operationElement.querySelector('#remove')
            .addEventListener('click', () =>
                storage.removeOperation(operation).then(() => operationElement.remove()));

        const isEnabledInput = operationElement.querySelector('#isEnabled');
        isEnabledInput.checked = operation.isEnabled;
        isEnabledInput.addEventListener('click', () =>
            storage.updateOperationIsEnabled(operation.isEnabled = isEnabledInput.checked, operation.id));

        const actionsContainer = operationElement.querySelector('#actions');
        for (const [index, action] of operation.actions.entries()) {
            actionsContainer.appendChild(await buildAction(action, index));
        }

        return operationElement;
    }

    const buildAction = async (action, index) => {
        const actionElement = await fetchFirstBodyElement('html/popup/popup_action.html');
        const nameElement = actionElement.querySelector('#name');
        nameElement.innerText = `[${index + 1}] ${action.typeName}`;
        if (action.error) {
            nameElement.parentElement.classList.add('error-action');
        } else if (!action.selector || (action.selector && action.selector !== '')) {
            nameElement.parentElement.classList.add('checked-action');
        } else {
            nameElement.parentElement.classList.add('warning-action');
        }
        // todo add edit selector icon button

        return actionElement;
    }

    container.querySelector('#options').addEventListener('click', () => chrome.tabs.create({
        url: `${location.protocol}//${location.hostname}/html/options.html`
    }));

    const currentOperationsElement = container.querySelector('#currentOperations');
    const otherOperationsElement = container.querySelector('#otherOperations');
    for (const operation of groupedOperations.currentPageOperations) {
        currentOperationsElement.appendChild(await buildOperation(operation));
    }
    for (const operation of groupedOperations.otherPagesOperations) {
        otherOperationsElement.appendChild(await buildOperation(operation));
    }

    const displayElement = 'active';
    const hideExposeElement = bodyElement => () => bodyElement.classList.contains(displayElement) ?
        bodyElement.classList.remove(displayElement) : bodyElement.classList.add(displayElement);

    container.querySelector('#currentOperationsTitle').parentElement
        .addEventListener('click', hideExposeElement(currentOperationsElement));

    container.querySelector('#otherOperationsTitle').parentElement
        .addEventListener('click', hideExposeElement(otherOperationsElement));

    container.querySelector('#currentOperationsTitle').innerText =
        `Current site actions [${groupedOperations.currentPageOperations.length}]`;
    container.querySelector('#otherOperationsTitle').innerText =
        `Other site actions [${groupedOperations.otherPagesOperations.length}]`;

})
