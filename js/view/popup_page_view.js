/*
checked-action #70AC85; No errors, all needed fields filled.
warning-action #FFDF8E; Not all needed fields filled.
error-action   #FD8B7B; Get's some errors while try to action.
 */
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

    const displayNone = 'd-none';
    const container = document.querySelector('[class*=container]');
    const operations = await storage.getOperations();
    const groupedOperations = operations.reduce((previousValue, currentValue) => {
        if (currentValue.regExes.some(regEx => window.location.href.match(regEx))) {
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
    container.querySelector('#currentOperationsTitle').innerText = `Current site actions [${groupedOperations.currentPageOperations.length}]`;
    container.querySelector('#otherOperationsTitle').innerText = `Other site actions [${groupedOperations.otherPagesOperations.length}]`;

    const getCardElements = cardElement => {
        return {
            cardElement,
            bodyElement: cardElement.querySelector('[class*=card-body]'),
            launchSpan: cardElement.querySelector('#launch'),
            titleElement: cardElement.querySelector('#title'),
            hideActionButton: cardElement.querySelector('#hideAction'),
            editButton: cardElement.querySelector('#edit'),
            removeButton: cardElement.querySelector('#remove'),
            launchOperationButton: cardElement.querySelector('#launchOperation'),
            isEnabledInput: cardElement.querySelector('#isEnabled'),
            actionsElement: cardElement.querySelector('#actions'),
        }
    }

    const hideExposeElement = bodyElement => () => bodyElement.classList.contains(displayNone) ?
        bodyElement.classList.remove(displayNone) : bodyElement.classList.add(displayNone);

    const createOperationEditTab = operation => () => chrome.tabs.create({
        url: `${location.protocol}//${location.hostname}/html/edit_operation.html?operation=${operation.id}`
    });

    const removeOperation = (operation, card) =>
        storage.removeOperation(operation).then(() => card.remove());

    const invertIsEnabled = (operation, cardElements) => () =>
        storage.updateOperationIsEnabled(operation.isEnabled = cardElements.isEnabledInput.checked, operation.id);

    const buildActionElement = async action => {
        const actionElement = document.createElement('div');
        actionElement.classList.add('d-flex');

        const actionNameElement = document.createElement('a');
        actionNameElement.innerText = action.typeName;

        if (action.selector === '') {
            actionElement.style.color = 'red';
            actionNameElement.innerText += ' [need add selector]';
        } else {
            actionElement.style.color = 'green';
        }

        const editIconElement = await fetchFirstBodyElement('icon/edit-solid.svg');

        actionElement.appendChild(actionNameElement);
        actionElement.appendChild(editIconElement);
        return actionElement;
    }

    const buildOperationCard = async operation => {
        const cardElements = getCardElements(await fetchFirstBodyElement('html/popup_card.html'));

        if (operations.length < 3) {
            cardElements.bodyElement.classList.remove(displayNone)
        }

        cardElements.launchSpan.innerText = 'Launch type: ' + operation.launch.type
            + (operation.launch.keys ? ` [${operation.launch.keys.reduce((prev, cur) => `${prev} + ${cur}`)}]` : '');
        cardElements.titleElement.innerText = operation.title;

        cardElements.hideActionButton.addEventListener('click', hideExposeElement(cardElements.bodyElement));
        cardElements.editButton.addEventListener('click', createOperationEditTab(operation));
        cardElements.removeButton.addEventListener('click', () => removeOperation(operation, cardElements.cardElement));

        cardElements.isEnabledInput.checked = operation.isEnabled;
        cardElements.isEnabledInput.addEventListener('click', invertIsEnabled(operation, cardElements))

        for (const action of operation.actions) {
            const actionElement = await buildActionElement(action);
            cardElements.actionsElement.appendChild(actionElement);
        }

        container.appendChild(cardElements.cardElement);
        return cardElements.cardElement;
    };

    const buildH3CenteredElement = (text) => {
        const headingElement = document.createElement('h3');
        headingElement.style.textAlign = 'center';
        headingElement.innerText = text;
        return headingElement;
    };
    //
    // if (groupedOperations.currentPageOperations.length) {
    //     container.appendChild(buildH3CenteredElement('Current page actions'));
    //
    //     for (const operation of groupedOperations.currentPageOperations) {
    //         await buildOperationCard(operation);
    //     }
    // }
    //
    // if (groupedOperations.otherPagesOperations.length) {
    //     container.appendChild(buildH3CenteredElement('Other pages actions'));
    //
    //     for (const operation of groupedOperations.otherPagesOperations) {
    //         const cardElement = await buildOperationCard(operation);
    //         const launchOperationButton = cardElement.querySelector('#launchOperation');
    //         launchOperationButton.parentElement.removeChild(launchOperationButton);
    //     }
    // }

})
