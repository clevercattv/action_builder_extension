function OperationView(launchKeys = [], regExes = []) {
    const operationActions = [
        {
            name: 'Click',
            type: 'click',
            file: 'html/action/click.html',
            fillInputs: (container, {selector}) => {
                container.querySelector('#selector').value = selector;
            }
        },
        {
            name: 'Download image',
            type: 'downloadImage',
            file: 'html/action/download_image.html',
            fillEvents: element => {
                const templates = element.querySelector('#templates');
                const name = element.querySelector('#name');
                Array.from(templates.children).forEach(button => button.addEventListener('click', () => {
                    name.value += `\$\{${button.getAttribute('data-name')}\}`
                }))
            },
            fillInputs: (container, {extension, name, selector}) => {
                container.querySelector('#name').value = name;
                container.querySelector('#extension').value = extension;
                container.querySelector('#selector').value = selector;
            }
        },
        {
            name: 'Wait',
            type: 'wait',
            file: 'html/action/wait.html',
            fillInputs: (container, {ms}) => {
                container.querySelector('#ms').value = ms;
            }
        },
        {
            name: 'Reload',
            type: 'reload',
            file: 'html/action/reload.html',
            fillInputs: () => {}
        },
    ];

    const elements = {
        launchTypeSelect: document.querySelector('#launchType'),
        launchKeysInput: document.querySelector('#launchKeys'),
        addRegExButton: document.querySelector('#addPageRegEx'),
        changeRegExButton: document.querySelector('#changePageRegEx'),
        removeRegExButton: document.querySelector('#removePageRegEx'),
        addActionButton: document.querySelector('#addAction'),
        createOperationButton: document.querySelector('#createOperation'),
        actionSelect: document.querySelector('#action'),
        actionsElement: document.querySelector('#actions'),
        regExesSelect: document.querySelector('#regExes'),
        regExInput: document.querySelector('#pageRegEx'),
        operationTitleInput: document.querySelector('#operationTitle'),
        operationPriorityInput: document.querySelector('#operationPriority'),
    }

    const fillRegExSelect = () => ui_generator.fillSelect(
        elements.regExesSelect,
        regExes.map(text => {
            return {'innerText': text};
        }));

    const changeLaunchType = () =>
        elements.launchKeysInput.disabled = elements.launchTypeSelect.value !== 'key';

    const fillLaunchKeys = () => elements.launchKeysInput.value = launchKeys.length ?
        launchKeys.reduce((prev, next) => `${prev} + ${next}`) : '';

    const editLaunchKeysEvent = event => {
        if (event.key === 'Backspace') {
            launchKeys.pop();
        } else if (launchKeys.length < 3) {
            launchKeys.push(event.key);
        }
        fillLaunchKeys();
    };

    const addRegExEvent = () => {
        if (elements.regExInput.value.length) {
            regExes.push(elements.regExInput.value);
            fillRegExSelect();
        }
    };

    const changeRegExEvent = () => {
        const selectedIndex = elements.regExesSelect.options.selectedIndex;
        elements.regExInput.value = regExes[selectedIndex]; // get first selected
        regExes.splice(selectedIndex, 1);
        fillRegExSelect();
    };

    const removeRegExEvent = () => {
        regExes.length = 0; // clear list
        regExes.push(...[...elements.regExesSelect.options].filter(option => !option.selected).map(option => option.innerText));
        fillRegExSelect();
    };

    const addActionCard = async (parent, actionInfo, card) => {
        if (!card) card = await ui_generator.action(actionInfo);
        addActionCardEvents(card);
        if (actionInfo.fillEvents) actionInfo.fillEvents(card);
        parent.appendChild(card);
    };

    const addActionCardEvents = (element) => {
        const actionsElement = elements.actionsElement;
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
            const prevIndex = Array.from(actionsElement.children).indexOf(element) - 1;
            const previousElement = actionsElement.children[prevIndex];
            if (!previousElement) return;
            actionsElement.insertBefore(element, previousElement);
        });

        const moveActionDown = element.querySelector('#moveActionDown');
        moveActionDown.addEventListener('click', () => {
            const nextIndex = Array.from(actionsElement.children).indexOf(element) + 1;
            const nextElement = actionsElement.children[nextIndex];
            if (!nextElement) return;
            actionsElement.insertBefore(nextElement, element);
        });
    }

    const createOperation = () => {
        const launchType = elements.launchTypeSelect;
        const title = document.getElementById('operationTitle').value;
        const launch = 'key' === launchType.value ?
            new LaunchKeys(launchKeys) : new Launch(launchType.value);
        const actions = Array.from(elements.actionsElement.children)
            .map(htmlAction => mapper.elementToAction[htmlAction.getAttribute('data-action')](htmlAction));
        const priority = document.getElementById('operationPriority').value;

        return new Operation(
            title,
            launch,
            regExes,
            actions,
            priority > 0 ? priority : 1
        );
    }

    ui_generator.fillSelect(
        elements.actionSelect,
        operationActions.map(action => action.name).map(text => {
            return {'innerText': text};
        }));

    fillRegExSelect();
    fillLaunchKeys();

    elements.launchTypeSelect.addEventListener('change', changeLaunchType);
    elements.launchKeysInput.addEventListener('keydown', editLaunchKeysEvent);
    elements.addRegExButton.addEventListener('click', addRegExEvent);
    elements.changeRegExButton.addEventListener('click', changeRegExEvent);
    elements.removeRegExButton.addEventListener('click', removeRegExEvent);
    elements.addActionButton.addEventListener('click', () =>
        addActionCard(elements.actionsElement, operationActions[elements.actionSelect.options.selectedIndex]));

    return {
        createOperation,
        addActionCard,
        operationActions,
        elements,

    }
}


