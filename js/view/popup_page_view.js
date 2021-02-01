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

    const activeKey = 'active';

    const container = document.querySelector('[class*=container]');
    const elements = {
        currentOperationTitle: container.querySelector('#currentOperationsTitle'),
        otherOperationsTitle: container.querySelector('#otherOperationsTitle'),
        currentOperations: container.querySelector('#currentOperations'),
        otherOperations: container.querySelector('#otherOperations'),
        options: container.querySelector('#options'),
    }

    const currentLocation = await new Promise(resolve =>
        chrome.tabs.query({active: true}, tab => resolve(tab[0].url)));

    const groupedOperations = (await storage.getOperations()).reduce((previousValue, currentValue) => {
        previousValue[currentValue.regExes.some(regEx => currentLocation.match(regEx)) ?
            'currentPageOperations' : 'otherPagesOperations'].push(currentValue);
        previousValue.allOperations.push(currentValue);
        return previousValue;
    }, {
        currentPageOperations: [],
        otherPagesOperations: [],
        allOperations: []
    });

    const getOperationElements = operationElement => {
        return {
            title: operationElement.querySelector('#title'),
            launch: operationElement.querySelector('#launch'),
            actionTitle: operationElement.querySelector('#actionTitle'),
            edit: operationElement.querySelector('#edit'),
            remove: operationElement.querySelector('#remove'),
            isEnabled: operationElement.querySelector('#isEnabled'),
            actions: operationElement.querySelector('#actions'),
        }
    }

    const buildOperation = async ({operation, operationCallback, actionCallback}) => {
        const operationContainer = await fetchFirstBodyElement('html/popup/popup_operation.html');
        const operationElements = getOperationElements(operationContainer);
        operationElements.title.innerText = operation.title;

        operationElements.launch.innerText = 'Launch type: ' + operation.launch.type
            + (operation.launch.keys ? ` [${operation.launch.keys.reduce((prev, cur) => `${prev} + ${cur}`)}]` : '');

        operationElements.actionTitle.innerText = `Actions [${operation.actions.length}]`;

        operationElements.edit.addEventListener('click', () => chrome.tabs.create({
            url: `${location.protocol}//${location.hostname}/html/edit_operation.html?operation=${operation.id}`
        }));

        operationElements.remove.addEventListener('click', () =>
            storage.removeOperation(operation).then(() => operationContainer.remove()));

        operationElements.isEnabled.checked = operation.isEnabled;
        operationElements.isEnabled.addEventListener('click', () =>
            storage.updateOperationIsEnabled(operation.isEnabled = operationElements.isEnabled.checked, operation.id));

        for (const [index, action] of operation.actions.entries()) {
            const actionElement = await buildAction(action, index);
            operationElements.actions.appendChild(actionElement);
            actionCallback(actionElement, action);
        }

        operationCallback(operationContainer);
        return operationContainer;
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
        return actionElement;
    }

    const toggleClass = bodyElement =>
        requestAnimationFrame(() => bodyElement.classList.contains(activeKey) ?
            bodyElement.classList.remove(activeKey) : bodyElement.classList.add(activeKey));

    elements.options.addEventListener('click', () => chrome.tabs.create({
        url: `${location.protocol}//${location.hostname}/html/options.html`
    }));

    for (const operation of groupedOperations.currentPageOperations) {
        elements.currentOperations.appendChild(await buildOperation({
            operation,
            operationCallback: operationElement => {
                operationElement.querySelector('#launchOperation')
                    .addEventListener('click', () => chrome.tabs.query({active: true},
                        tabs => chrome.tabs.executeScript(
                            tabs[0].id,
                            {code: `operationLauncher.launchOperationActions(${JSON.stringify(operation)})`},
                            () => window.close()
                        )
                    ));
            },
            actionCallback: (actionElement, action) => {
                actionElement.querySelector('#editSelector')
                    .addEventListener('click', () => {
                        chrome.tabs.query({active: true}, tabs => {
                            chrome.tabs.executeScript(tabs[0].id, {
                                code: `
                        var action = JSON.parse('${JSON.stringify(action)}');
                        var operationId = '${operation.id}';
                        `
                            }, () => chrome.tabs.executeScript(tabs[0].id, {
                                file: 'js/inject_script/change_action_selector.js'
                            }))
                        })
                    });
            }
        }));
    }

    for (const operation of groupedOperations.otherPagesOperations) {
        elements.otherOperations.appendChild(await buildOperation({
            operation,
            operationCallback: operationElement => {
                operationElement.querySelector('#launchOperation').remove();
            },
            actionCallback: actionElement => {
                actionElement.querySelector('#editSelector').remove();
            }
        }));
    }

    elements.currentOperationTitle.parentElement.addEventListener('click',
        () => toggleClass(elements.currentOperations));
    elements.otherOperationsTitle.parentElement.addEventListener('click',
        () => toggleClass(elements.otherOperations));

    elements.currentOperationTitle.innerText = `Current site actions [${groupedOperations.currentPageOperations.length}]`;
    elements.otherOperationsTitle.innerText = `Other site actions [${groupedOperations.otherPagesOperations.length}]`;

})
