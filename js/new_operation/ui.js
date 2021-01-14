const newOperationUi = (() => {
    const operationLaunchKeys = [];
    const operationRegExes = [];
    /**
     * Contains all interactive elements. (without generated elements!!!)
     * @type {Object<string, Element>}
     */
    const elements = {};

    /**
     * Contains all event listeners functions. (without generated events!!!)
     * @type {Object<string, Function>}
     */
    const events = {};

    /**
     * Initialize elements and events variables
     */
    const init = () => Object.entries(
        {
            launchTypeSelect: {
                selector: '#launchType',
                event: changeLaunchTypeEvent,
                eventType: 'change'
            },
            launchKeysInput: {
                selector: '#launchKeys',
                event: editLaunchKeysEvent,
                eventType: 'keydown'
            },
            createRegExButton: {
                selector: '#addPageRegEx',
                event: addRegExEvent,
                eventType: 'click'
            },
            changeRegExButton: {
                selector: '#changePageRegEx',
                event: changeRegExEvent,
                eventType: 'click'
            },
            removeRegExButton: {
                selector: '#removePageRegEx',
                event: removeRegExEvent,
                eventType: 'click'
            },
            addActionButton: {
                selector: '#addAction',
                event: addActionEvent,
                eventType: 'click'
            },
            createOperationButton: {
                selector: '#createOperation',
                event: createOperationEvent,
                eventType: 'click'
            },
            actionSelect: {
                selector: '#action',
            },
            actionsElements: {
                selector: '#actions'
            },
            regExesSelect: {
                selector: '#regExes'
            },
            regExInput: {
                selector: '#pageRegEx'
            },
            operationTitleInput: {
                selector: '#operationTitle'
            },
            operationPriorityInput: {
                selector: '#operationPriority'
            },
        }
    ).forEach(entry => {
        const key = entry[0];
        const value = entry[1];
        elements[key] = document.querySelector(value.selector);
        if (value.event) {
            events[key] = () => elements[key].addEventListener(value.eventType, value.event);
        }
    });

    /**
     * Execute all events functions
     */
    const fillEventListeners = () => Object.entries(events)
        .map(entry => entry[1])
        .forEach(fn => fn());

    /**
     * @param {Array<string>} keys
     */
    const setLaunchKeys = keys => {
        if (!keys) return;
        operationLaunchKeys.length = 0;
        if (keys.length > 3) {
            keys.length = 3;
        }
        operationLaunchKeys.push(...keys);
    }

    /**
     * @param {Array<string>} regExes
     */
    const setRegExes = regExes => {
        if (!regExes) return;
        operationRegExes.length = 0;
        operationRegExes.push(...regExes);
    }

    const fillActionsSelect = () => ui_generator.fillSelect(
        elements.actionSelect, operationActions.map(action => action.name).map(innerTextObject));

    const fillRegExSelect = () => ui_generator.fillSelect(
        elements.regExesSelect, operationRegExes.map(innerTextObject));

    const innerTextObject = text => {
        return {'innerText': text};
    }

    /**
     * Set actions elements
     * @param {Action[]} actions
     */
    const setActions = actions => actions.forEach(action => {
        const operationAction = operationActions.filter(info => info.type === action.type).pop();
        elements.actionsElements.innerHTML = '';
        ui_generator.action(operationAction).then(element => {
            fillActionCardEvents(element);
            Object.keys(action) // fill inputs using all Action fields without type
                .filter(key => key !== 'type')
                .forEach(key => element.querySelector(`#${key}`).value = action[key])
            elements.actionsElements.appendChild(element);
        });
    });

    const changeLaunchTypeEvent = () => elements.launchKeysInput.disabled = elements.launchTypeSelect.value !== 'key';

    const editLaunchKeysEvent = event => {
        if (event.key === 'Backspace') {
            operationLaunchKeys.pop();
        } else if (operationLaunchKeys.length < 3) {
            operationLaunchKeys.push(event.key);
        }
        elements.launchKeysInput.value = operationLaunchKeys.length ?
            operationLaunchKeys.reduce((prev, next) => `${prev} + ${next}`) : '';
    };

    const addRegExEvent = () => {
        if (elements.regExInput.value.length) {
            operationRegExes.push(elements.regExInput.value);
            fillRegExSelect();
        }
    };

    const changeRegExEvent = () => {
        const selectedIndex = elements.regExesSelect.options.selectedIndex;
        elements.regExInput.value = operationRegExes[selectedIndex]; // get first selected
        operationRegExes.splice(selectedIndex, 1);
        fillRegExSelect();
    };

    const removeRegExEvent = () => {
        operationRegExes.length = 0; // clear list
        operationRegExes.push(...[...elements.regExesSelect.options].filter(option => !option.selected).map(option => option.innerText));
        fillRegExSelect();
    };

    const addActionEvent = async () => {
        const actionInfo = operationActions[elements.actionSelect.options.selectedIndex];
        const element = await ui_generator.action(actionInfo);
        fillActionCardEvents(element);
        elements.actionsElements.appendChild(element);
    };

    const fillActionCardEvents = (element) => {
        const operationActions = elements.actionsElements;
        const removeAction = element.querySelector('#removeAction');
        removeAction.addEventListener('click',
            () => element.parentNode.removeChild(element));

        const hideAction = element.querySelector('#hideAction');
        hideAction.addEventListener('click', () => {
            const cardBody = hideAction.parentElement.parentElement.querySelector('div[class*=card-body]');
            cardBody.classList.contains('d-none') ? cardBody.classList.remove('d-none') : cardBody.classList.add('d-none');
        });

        const moveActionUp = element.querySelector('#moveActionUp');
        moveActionUp.addEventListener('click', () => {
            const prevIndex = Array.from(operationActions.children).indexOf(element) - 1;
            const previousElement = operationActions.children[prevIndex];
            if (!previousElement) return;
            operationActions.insertBefore(element, previousElement);
        });

        const moveActionDown = element.querySelector('#moveActionDown');
        moveActionDown.addEventListener('click', () => {
            const nextIndex = Array.from(operationActions.children).indexOf(element) + 1;
            const nextElement = operationActions.children[nextIndex];
            if (!nextElement) return;
            operationActions.insertBefore(nextElement, element);
        });
    }

    const createOperationEvent = () => {
        const launchType = elements.launchTypeSelect;
        const title = document.getElementById('operationTitle').value;
        const launch = 'key' === launchType.value ?
            new LaunchKeys(operationLaunchKeys) : new Launch(launchType.value);
        const actions = Array.from(elements.actionsElements.children)
            .map(htmlAction => mapper.elementToAction[htmlAction.getAttribute('data-action')](htmlAction));
        const priority = document.getElementById('operationPriority').value;

        const operation = new Operation(
            title,
            launch,
            operationRegExes,
            actions,
            priority > 0 ? priority : 1
        );
        storage.createOperation(operation).then(console.log);
        return true;
    }

    return {
        init,
        fillEventListeners,
        fillActionsSelect,
        setLaunchKeys,
        setRegExes,
        createOperationEvent,
        elements,
        events,
        setActions,
        fillRegExSelect
    }
})();
