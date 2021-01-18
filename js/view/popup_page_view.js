window.addEventListener('load', async () => {
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

    if (groupedOperations.currentPageOperations.length) {
        container.appendChild(buildH3CenteredElement('Current page actions'));

        for (const operation of groupedOperations.currentPageOperations) {
            await buildOperationCard(operation);
        }
    }

    if (groupedOperations.otherPagesOperations.length) {
        container.appendChild(buildH3CenteredElement('Other pages actions'));

        for (const operation of groupedOperations.otherPagesOperations) {
            const cardElement = await buildOperationCard(operation);
            const launchOperationButton = cardElement.querySelector('#launchOperation');
            launchOperationButton.parentElement.removeChild(launchOperationButton);
        }
    }

})
